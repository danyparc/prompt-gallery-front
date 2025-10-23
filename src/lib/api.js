import { supabase } from './supabase.js'
import { mockListPrompts, mockToggleLike, mockGetUserFavorites, mockCreatePrompt, mockImprovePrompt } from './mockData.js'

// Set to true to use mock data for development
const USE_MOCK_DATA = true

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
      .from('prompts')
      .select(`
        *,
        profiles:profiles!prompts_author_id_fkey(full_name),
        likes_count:likes(count),
        current_user_liked:likes!inner(user_id)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (q) {
      query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`)
    }
    if (category) {
      query = query.contains('categories', [category])
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
      authorName: prompt.profiles?.full_name || 'Anonymous',
      likesCount: prompt.likes_count?.[0]?.count || 0,
      currentUserLiked: prompt.current_user_liked?.length > 0
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

    // Check if user already liked this prompt
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike
      await supabase
        .from('likes')
        .delete()
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)
    } else {
      // Like
      await supabase
        .from('likes')
        .insert({ prompt_id: promptId, user_id: user.id })
    }

    // Get updated like count
    const { data: likeCount } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('prompt_id', promptId)

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
        prompts (
          *,
          profiles:profiles!prompts_author_id_fkey(full_name),
          likes_count:likes(count)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    // Transform data
    const transformedData = data?.map(like => ({
      ...like.prompts,
      authorName: like.prompts.profiles?.full_name || 'Anonymous',
      likesCount: like.prompts.likes_count?.length || 0,
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
      .select(`
        *,
        profiles:profiles!prompt_author_id_fkey(full_name)
      `)
      .single()

    if (error) throw error

    // Transform data to match frontend model
    return {
      ...data,
      authorName: data.profiles?.full_name || 'Anonymous',
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
 * Improve a prompt using AI
 * @param {string} originalContent - The original prompt content
 * @returns {Promise<{improvedContent: string, suggestions: string[]}>}
 */
export async function improvePrompt(originalContent) {
  if (USE_MOCK_DATA) {
    return mockImprovePrompt(originalContent)
  }

  try {
    // In a real implementation, this would call an AI service
    // For now, we'll use the mock function even in production mode
    return mockImprovePrompt(originalContent)
  } catch (error) {
    console.error('Error improving prompt:', error)
    throw error
  }
}