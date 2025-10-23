import { supabase } from './supabase.js'
import { mockListPrompts, mockToggleLike, mockGetUserFavorites, mockCreatePrompt, mockImprovePrompt } from './mockData.js'

// Set to true to use mock data for development
const USE_MOCK_DATA = false

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string[]} categories
 * @property {string} authorName
 * @property {string} language
 * @property {string[]} models
 * @property {number} likesCount
 * @property {boolean=} currentUserLiked
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * List prompts with optional filters and pagination
 * @param {Object} options
 * @param {string} [options.q] - Search query
 * @param {string} [options.category] - Category filter
 * @param {string} [options.language] - Language filter
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.pageSize=10] - Items per page
 * @returns {Promise<{data: Prompt[], total: number}>}
 */
export async function listPrompts({ q, category, language, page = 1, pageSize = 10 }) {
  if (USE_MOCK_DATA) {
    return mockListPrompts({ q, category, language, page, pageSize })
  }

  try {
    let query = supabase
      .from('prompt')
      .select(`
        *
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
    }
    if (category) {
      query = query.contains('category_slugs', [category.toLowerCase().replace(/\s+/g, '-')])
    }
    if (language) {
      query = query.eq('language', language)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    // Transform data to match our frontend model
    const transformedData = data?.map(prompt => ({
      ...prompt,
      body: prompt.content, // Legacy compatibility
      categories: prompt.category_slugs?.map(slug => 
        slug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      ) || [],
      authorName: prompt.author?.email || 'Anonymous',
      likesCount: prompt.likes_count || 0,
      currentUserLiked: false // We'll handle this separately for authenticated users
    })) || []

    return { data: transformedData, total: count || 0 }
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return { data: [], total: 0 }
  }
}

/**
 * Toggle like for a prompt
 * @param {string} promptId
 * @returns {Promise<{likesCount: number, currentUserLiked: boolean}>}
 */
export async function toggleLike(promptId) {
  if (USE_MOCK_DATA) {
    return mockToggleLike(promptId)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to like prompts')
    }

    // For now, let's use a simple approach since we don't have the exact likes table structure
    // In a real implementation, you'd need to create a proper likes table
    // This is a placeholder that won't work with the current schema
    
    // Since the schema shows likes_count as a cached field, we'll simulate the toggle
    // In a real app, you'd need to:
    // 1. Create a separate likes table
    // 2. Use triggers to update the cached likes_count
    
    // For now, return mock data
    throw new Error('Likes functionality requires additional database setup')

    return {
      likesCount: likeCount?.length || 0,
      currentUserLiked: !existingLike
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    throw error
  }
}

/**
 * Get current user's favorite prompts
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=10] - Items per page
 * @returns {Promise<{data: Prompt[], total: number}>}
 */
export async function getUserFavorites(page = 1, pageSize = 10) {
  if (USE_MOCK_DATA) {
    return mockGetUserFavorites(page, pageSize)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: [], total: 0 }
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('likes')
      .select(`
        prompt (
          *,
          auth.users:auth.users!prompt_author_id_fkey(id),
          likes_count:likes(count)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    // Transform data
    const transformedData = data?.map(like => ({
      ...like.prompt,
      authorName: like.prompt['auth.users']?.id || 'Anonymous', // Using user ID as name since we don't have full_name
      likesCount: like.prompt.likes_count?.length || 0,
      currentUserLiked: true
    })) || []

    return { data: transformedData, total: count || 0 }
  } catch (error) {
    console.error('Error fetching user favorites:', error)
    return { data: [], total: 0 }
  }
}

/**
 * Create a new prompt
 * @param {Object} promptData
 * @param {string} promptData.title - The prompt title
 * @param {string} promptData.content - The prompt content
 * @param {string[]} [promptData.categories] - Categories for the prompt
 * @param {string} [promptData.type] - Type of prompt
 * @param {string} [promptData.language] - Language of the prompt
 * @param {string[]} [promptData.models] - Models tested with this prompt
 * @param {string[]} [promptData.tags] - Tags for the prompt
 * @returns {Promise<Prompt>}
 */
export async function createPrompt(promptData) {
  if (USE_MOCK_DATA) {
    return mockCreatePrompt(promptData)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to create prompts')
    }

    const newPrompt = {
      author_id: user.id,
      title: promptData.title,
      content: promptData.content,
      type: promptData.type || 'general',
      language: promptData.language || 'English',
      category_slugs: promptData.categories?.map(cat => cat.toLowerCase().replace(/\s+/g, '-')) || [],
      tags: promptData.tags || [],
      models: promptData.models || [],
      is_public: true
    }

    const { data, error } = await supabase
      .from('prompt')
      .insert(newPrompt)
      // .select(`
      //   *,
      //   profiles:profiles!prompt_author_id_fkey(full_name)
      // `)
      // .single()

    if (error) throw error

    // Transform data to match frontend model
    return {
      ...data,
      authorName: 'You', // Current user is the author
      body: data.content, // Legacy compatibility
      categories: promptData.categories || [],
      likesCount: 0,
      currentUserLiked: false
    }
  } catch (error) {
    console.error('Error creating prompt:', error)
    throw error
  }
}

/**
 * Improve a prompt using AI via the refine API
 * @param {string} originalContent - The original prompt content
 * @param {string} taskType - The type of task (e.g., 'code', 'creative', 'general')
 * @returns {Promise<{analysis: Object, variants: Object, best: Object, improvedContent: string, suggestions: string[]}>}
 */
export async function improvePrompt(originalContent, taskType = 'general') {
  if (USE_MOCK_DATA) {
    return mockImprovePrompt(originalContent)
  }

  try {
    const response = await fetch('http://3.134.5.42/api/refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: originalContent,
        task_type: taskType
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to refine prompt: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform the API response to match the expected format
    return {
      improvedContent: data.best?.content || data.variants?.detailed || originalContent,
      suggestions: data.analysis?.suggestions || [],
      analysis: data.analysis,
      variants: data.variants,
      best: data.best,
      evaluations: data.evaluations,
      metadata: data.metadata
    }
  } catch (error) {
    console.error('Error improving prompt:', error)
    // Fallback to mock data if the API fails
    return mockImprovePrompt(originalContent)
  }
}