import { useState } from 'react'
import LikeButton from './LikeButton.jsx'

export default function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getExcerpt = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-base-200 rounded-lg shadow-lg p-6 prompt-card-hover hover:bg-base-300 transition-colors border border-base-300">
      {/* Title */}
      <h2 className="text-lg font-bold text-base-content mb-3 line-clamp-2">
        {prompt.title}
      </h2>

      {/* Excerpt */}
      <p className="text-base-content/70 text-sm leading-relaxed mb-4 line-clamp-3">
        {getExcerpt(prompt.body)}
      </p>

      {/* Categories */}
      {prompt.categories && prompt.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.categories.slice(0, 3).map((category, index) => (
            <span key={index} className="badge badge-neutral badge-sm">
              {category}
            </span>
          ))}
          {prompt.categories.length > 3 && (
            <span className="badge badge-ghost badge-sm">
              +{prompt.categories.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Models */}
      {prompt.models && prompt.models.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {prompt.models.slice(0, 2).map((model, index) => (
            <span key={index} className="badge badge-secondary badge-sm">
              {model}
            </span>
          ))}
          {prompt.models.length > 2 && (
            <span className="badge badge-ghost badge-sm">
              +{prompt.models.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-base-content/60 mb-4">
        <div className="flex items-center space-x-2">
          <span>by {prompt.authorName}</span>
          <span>•</span>
          <span>{formatDate(prompt.createdAt)}</span>
          {prompt.language && (
            <>
              <span>•</span>
              <span className="badge badge-outline badge-xs">
                {prompt.language}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <LikeButton
          promptId={prompt.id}
          likesCount={prompt.likesCount}
          currentUserLiked={prompt.currentUserLiked}
        />

        <button
          className={`btn btn-sm ${
            copied 
              ? 'btn-success' 
              : 'btn-outline btn-neutral'
          }`}
          onClick={handleCopyPrompt}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}