import { useState, useEffect } from 'react'
import { useFeed } from '../context/FeedContext.jsx'
import { listPrompts } from '../lib/api.js'
import PromptCard from '../components/PromptCard.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { EmptyPrompts } from '../components/EmptyState.jsx'

const PROMPTS_PER_PAGE = 9

export default function Feed() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const { filters, page, setPage, clearOptimisticLikes } = useFeed()

  const totalPages = Math.ceil(total / PROMPTS_PER_PAGE)

  // Fetch prompts when filters or page changes
  useEffect(() => {
    fetchPrompts()
  }, [filters, page])

  const fetchPrompts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await listPrompts({
        ...filters,
        page,
        pageSize: PROMPTS_PER_PAGE
      })
      
      setPrompts(result.data)
      setTotal(result.total)
      
      // Clear optimistic likes when new data loads
      clearOptimisticLikes()
    } catch (err) {
      setError(err.message || 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchPrompts()
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

  const hasActiveFilters = filters.q || filters.category || filters.language

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Discover Amazing Prompts
          </h1>
          <p className="text-gray-400 mt-2">
            Explore, like, and copy prompts from our community
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
            Discover Amazing Prompts
          </h1>
        </div>
        <ErrorState
          title="Failed to load prompts"
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
            Discover Amazing Prompts
          </h1>
          <p className="text-gray-400 mt-2">
            {hasActiveFilters 
              ? 'No prompts match your current filters' 
              : 'Be the first to share a prompt!'
            }
          </p>
        </div>
        <EmptyPrompts />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Discover Amazing Prompts
        </h1>
        <p className="text-gray-400 mt-2">
          {total > 0 && (
            <>
              Showing {((page - 1) * PROMPTS_PER_PAGE) + 1}-{Math.min(page * PROMPTS_PER_PAGE, total)} of {total} prompts
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