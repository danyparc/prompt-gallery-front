import { createContext, useContext, useState } from 'react'
import { toggleLike as apiToggleLike, likePrompt, unlikePrompt } from '../lib/api.js'

const FeedContext = createContext({})

export function useFeed() {
  const context = useContext(FeedContext)
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider')
  }
  return context
}

export function FeedProvider({ children }) {
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    language: ''
  })
  const [page, setPage] = useState(1)
  const [likes, setLikes] = useState(new Map()) // promptId -> { likesCount, currentUserLiked }

  /**
   * Update filters
   * @param {Object} newFilters
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to first page when filters change
  }

  /**
   * Toggle like for a prompt with optimistic UI
   * @param {string} promptId
   * @param {number} currentLikesCount
   * @param {boolean} currentUserLiked
   * @returns {Promise<void>}
   */
  const toggleLike = async (promptId, currentLikesCount, currentUserLiked) => {
    // Optimistic update
    const optimisticLikesCount = currentUserLiked 
      ? currentLikesCount - 1 
      : currentLikesCount + 1
    const optimisticUserLiked = !currentUserLiked

    setLikes(prev => new Map(prev.set(promptId, {
      likesCount: optimisticLikesCount,
      currentUserLiked: optimisticUserLiked
    })))

    try {
      // Use specific API calls for better control
      const result = currentUserLiked 
        ? await unlikePrompt(promptId)
        : await likePrompt(promptId)
      
      // Update with actual result from the API
      setLikes(prev => new Map(prev.set(promptId, {
        likesCount: result.likesCount,
        currentUserLiked: result.currentUserLiked
      })))

      return result
    } catch (error) {
      // Revert optimistic update on error
      setLikes(prev => new Map(prev.set(promptId, {
        likesCount: currentLikesCount,
        currentUserLiked: currentUserLiked
      })))
      
      // Enhanced error handling
      if (error.message.includes('authenticated')) {
        console.error('User must be logged in to like prompts')
      } else if (error.code === '23505') {
        // Handle duplicate like gracefully
        console.log('Like already exists - refreshing state')
        // You might want to refresh the actual state here
      } else {
        console.error('Failed to toggle like:', error)
      }
      
      throw error
    }
  }

  /**
   * Get like state for a prompt (with optimistic updates)
   * @param {string} promptId
   * @param {number} defaultLikesCount
   * @param {boolean} defaultUserLiked
   * @returns {{likesCount: number, currentUserLiked: boolean}}
   */
  const getLikeState = (promptId, defaultLikesCount, defaultUserLiked) => {
    const optimisticState = likes.get(promptId)
    return optimisticState || {
      likesCount: defaultLikesCount,
      currentUserLiked: defaultUserLiked
    }
  }

  /**
   * Clear all optimistic like states (useful for refetching data)
   */
  const clearOptimisticLikes = () => {
    setLikes(new Map())
  }

  const value = {
    filters,
    page,
    setPage,
    updateFilters,
    toggleLike,
    getLikeState,
    clearOptimisticLikes,
  }

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  )
}