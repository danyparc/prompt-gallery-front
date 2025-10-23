import { useAuth } from '../context/AuthContext.jsx'
import { useFeed } from '../context/FeedContext.jsx'

export default function LikeButton({ promptId, likesCount, currentUserLiked, className = '' }) {
  const { user } = useAuth()
  const { toggleLike, getLikeState } = useFeed()

  // Get current like state (including optimistic updates)
  const likeState = getLikeState(promptId, likesCount, currentUserLiked)

  const handleLike = async () => {
    if (!user) {
      // Could trigger auth dialog here
      alert('Please sign in to like prompts')
      return
    }

    try {
      await toggleLike(promptId, likeState.likesCount, likeState.currentUserLiked)
    } catch (error) {
      // Error handling is done in the context
    }
  }

  return (
    <button
      className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        likeState.currentUserLiked 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
      } ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={handleLike}
      disabled={!user}
    >
      <svg 
        className={`w-4 h-4 ${likeState.currentUserLiked ? 'fill-current' : ''}`}
        fill={likeState.currentUserLiked ? "currentColor" : "none"}
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span>{likeState.likesCount}</span>
    </button>
  )
}