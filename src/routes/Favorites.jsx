import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserFavorites } from '../lib/api.js'
import PromptCard from '../components/PromptCard.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { EmptyFavorites } from '../components/EmptyState.jsx'

const PROMPTS_PER_PAGE = 9

export default function Favorites() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(total / PROMPTS_PER_PAGE)

  // Fetch user's favorites
  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user, page])

  const fetchFavorites = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await getUserFavorites(page, PROMPTS_PER_PAGE)
      setPrompts(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchFavorites()
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Your Favorite Prompts
          </h1>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Sign in to view favorites</h2>
          <p className="text-gray-400 mb-6">
            You need to be signed in to access your favorite prompts collection.
          </p>
          <button 
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => {
              // This would trigger the auth dialog from the header
              // For now, we'll just show a message
              alert('Please use the Sign In button in the header')
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Your Favorite Prompts
          </h1>
          <p className="text-gray-400 mt-2">
            Your personal collection of liked prompts
          </p>
        </div>
        <LoadingSkeleton count={PROMPTS_PER_PAGE} />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Your Favorite Prompts
          </h1>
        </div>
        <ErrorState
          title="Failed to load favorites"
          description={error}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Your Favorite Prompts
          </h1>
          <p className="text-gray-400 mt-2">
            Your personal collection of liked prompts
          </p>
        </div>
        <EmptyFavorites />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Your Favorite Prompts
        </h1>
        <p className="text-gray-400 mt-2">
          {total > 0 && (
            <>
              {total} favorite prompt{total !== 1 ? 's' : ''} in your collection
            </>
          )}
        </p>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {prompts.map(prompt => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
          </div>

          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}