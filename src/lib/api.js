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

    // First, check if the user has already liked this prompt
    const { data: existingLike, error: checkError } = await supabase
      .from('prompt_like')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError
    }

    let likesCount = 0
    let currentUserLiked = false

    if (existingLike) {
      // User has already liked - remove the like
      const { error: deleteError } = await supabase
        .from('prompt_like')
        .delete()
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)

      if (deleteError) {
        throw deleteError
      }
      
      currentUserLiked = false
    } else {
      // User hasn't liked yet - add the like
      const { error: insertError } = await supabase
        .from('prompt_like')
        .insert([{ prompt_id: promptId, user_id: user.id }])

      if (insertError) {
        if (insertError.code === '23505') {
          // Conflict - user already liked (race condition)
          console.log('⚠️ Ya habías dado like a este prompt.')
          currentUserLiked = true
        } else {
          throw insertError
        }
      } else {
        currentUserLiked = true
      }
    }

    // Get the updated likes count from the prompt table
    const { data: promptData, error: promptError } = await supabase
      .from('prompt')
      .select('likes_count')
      .eq('id', promptId)
      .single()

    if (promptError) {
      throw promptError
    }

    likesCount = promptData?.likes_count || 0

    return {
      likesCount,
      currentUserLiked
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    throw error
  }
}

/**
 * Like a prompt
 * @param {string} promptId - The ID of the prompt to like
 * @returns {Promise<Object>} Result with likesCount and currentUserLiked
 */
export async function likePrompt(promptId) {
  if (USE_MOCK_DATA) {
    return mockToggleLike(promptId)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to like prompts')
    }

    // Insert the like with explicit user_id
    const { data, error } = await supabase
      .from('prompt_like')
      .insert([{ prompt_id: promptId, user_id: user.id }])
      .select()

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️ Ya habías dado like a este prompt.')
        // Get current state since user already liked
        const { data: promptData } = await supabase
          .from('prompt')
          .select('likes_count')
          .eq('id', promptId)
          .single()
        
        return {
          likesCount: promptData?.likes_count || 0,
          currentUserLiked: true
        }
      } else {
        throw error
      }
    }

    // Get the updated likes count
    const { data: promptData, error: promptError } = await supabase
      .from('prompt')
      .select('likes_count')
      .eq('id', promptId)
      .single()

    if (promptError) {
      throw promptError
    }

    console.log('✅ Like registrado:', data)
    return {
      likesCount: promptData?.likes_count || 0,
      currentUserLiked: true
    }
  } catch (error) {
    console.error('❌ Error al crear el like:', error.message)
    throw error
  }
}

/**
 * Unlike a prompt
 * @param {string} promptId - The ID of the prompt to unlike
 * @returns {Promise<Object>} Result with likesCount and currentUserLiked
 */
export async function unlikePrompt(promptId) {
  if (USE_MOCK_DATA) {
    return mockToggleLike(promptId)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to unlike prompts')
    }

    // Remove the like
    const { error } = await supabase
      .from('prompt_like')
      .delete()
      .eq('prompt_id', promptId)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    // Get the updated likes count
    const { data: promptData, error: promptError } = await supabase
      .from('prompt')
      .select('likes_count')
      .eq('id', promptId)
      .single()

    if (promptError) {
      throw promptError
    }

    console.log('💔 Like eliminado')
    return {
      likesCount: promptData?.likes_count || 0,
      currentUserLiked: false
    }
  } catch (error) {
    console.error('❌ Error al quitar el like:', error.message)
    throw error
  }
}

/**
 * Check if user has liked a prompt
 * @param {string} promptId - The ID of the prompt to check
 * @returns {Promise<boolean>} Whether the user has liked the prompt
 */
export async function hasUserLikedPrompt(promptId) {
  if (USE_MOCK_DATA) {
    // Mock implementation
    return Math.random() > 0.5 // Random for testing
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    const { data, error } = await supabase
      .from('prompt_like')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return !!data // Returns true if like exists, false otherwise
  } catch (error) {
    console.error('Error checking like status:', error)
    return false
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
      body: promptData.content, // Legacy compatibility
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
    const response = await fetch('https://3.134.5.42:80/api/refine', {
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