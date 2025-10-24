import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { createPrompt, improvePrompt } from '../lib/api.js'
import isologo from '../assets/isologo.png'
const categories = [
  'Creative Writing',
  'Code Generation',
  'Analysis',
  'Education',
  'Business',
  'Research',
  'Cars',
  'Sells',
  'Fun',
  'General'
]

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese'
]

const models = [
  'GPT-4',
  'GPT-3.5',
  'Claude',
  'Gemini',
  'Llama',
  'Other'
]

export default function Create() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    language: 'English',
    models: [],
    type: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [error, setError] = useState('')
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [refineResults, setRefineResults] = useState(null)
  const [showRefineModal, setShowRefineModal] = useState(false)

  // Check if user is authenticated
  if (!user && !showAuthPrompt) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center mb-4">Sign in Required</h2>
            <p className="text-base-content/70 mb-6">
              You need to sign in to create and share prompts with the community.
            </p>
            <div className="card-actions justify-center">
              <button
                className="btn btn-primary"
                onClick={() => setShowAuthPrompt(true)}
              >
                Sign In to Continue
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/')}
              >
                Browse Prompts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleModelToggle = (model) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models.includes(model)
        ? prev.models.filter(m => m !== model)
        : [...prev.models, model]
    }))
  }

  const handleImprove = async () => {
    if (!formData.content.trim()) {
      setError('Please enter some content before improving')
      return
    }

    setIsImproving(true)
    try {
      // Determine task type based on categories
      const taskType = formData.categories.includes('Code Generation') ? 'code' : 
                       formData.categories.includes('Creative Writing') ? 'creative' : 'general'
      
      const result = await improvePrompt(formData.content, taskType)
      setRefineResults(result)
      setShowRefineModal(true)
    } catch (error) {
      setError('Failed to improve prompt. Please try again.')
    } finally {
      setIsImproving(false)
    }
  }

  const handleSelectVariant = (variantContent) => {
    setFormData(prev => ({ ...prev, content: variantContent }))
    setShowRefineModal(false)
    setRefineResults(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in both title and content')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await createPrompt({
        title: formData.title.trim(),
        content: formData.content.trim(),
        categories: formData.categories,
        language: formData.language,
        models: formData.models,
        type: formData.type
      })

      console.log({response});
      // Success - navigate back to feed
      navigate('/', {
        state: {
          message: 'Prompt shared successfully! 🎉'
        }
      })
    } catch (error) {
      setError(error.message || 'Failed to share prompt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title.trim() && formData.content.trim()
  const characterCount = formData.content.length
  const maxCharacters = 200000

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                <div 
                  className="avatar placeholder bg-gradient-to-br from-primary to-primary-focus rounded-full w-12 h-12 flex items-center justify-center"
                  style={{
                  backgroundImage: `url(${isologo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Fallback text if image fails to load */}
                  <span className="text-lg text-primary-content opacity-0">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-base-content">Create a new prompt</h2>
                  <p className="text-sm text-base-content/60">Share your prompt with the community</p>
                </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Give your prompt a catchy title..."
                className="input input-bordered w-full text-lg font-medium"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={120}
              />
            </div>

            {/* Content */}
            <div className="relative">
              <textarea
                placeholder="Write your prompt here... Be specific and clear about what you want the AI to do."
                className="textarea textarea-bordered w-full h-40 text-base resize-none"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                maxLength={maxCharacters}
              />
              <div className="absolute bottom-2 right-2 text-xs text-base-content/50">
                {characterCount}/{maxCharacters}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Categories (select up to 3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    className={`badge badge-lg ${formData.categories.includes(category)
                        ? 'badge-primary'
                        : 'badge-outline hover:badge-primary'
                      }`}
                    onClick={() => handleCategoryToggle(category)}
                    disabled={!formData.categories.includes(category) && formData.categories.length >= 3}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Language and Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Language</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Models */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Tested with (optional)</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {models.map(model => (
                    <button
                      key={model}
                      type="button"
                      className={`badge badge-sm ${formData.models.includes(model)
                          ? 'badge-secondary'
                          : 'badge-outline hover:badge-secondary'
                        }`}
                      onClick={() => handleModelToggle(model)}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-error">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="btn btn-outline gap-2 flex-1"
                onClick={handleImprove}
                disabled={isImproving || !formData.content.trim()}
              >
                {isImproving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Improving...
                  </>
                ) : (
                  <>
                    <span className="text-lg">✨</span>
                    Improve Prompt
                  </>
                )}
              </button>

              <button
                type="submit"
                className="btn btn-primary gap-2 flex-1"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sharing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Prompt
                  </>
                )}
              </button>
            </div>

            {/* Cancel */}
            <div className="text-center">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Refine Results Modal */}
      {showRefineModal && refineResults && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">✨ Prompt Analysis & Variants</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowRefineModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Analysis Section */}
            {refineResults.analysis && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title">Clarity Score</div>
                    <div className="stat-value text-2xl">
                      {Math.round((refineResults.analysis.clarity_score || 0) * 100)}%
                    </div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title">Completeness Score</div>
                    <div className="stat-value text-2xl">
                      {Math.round((refineResults.analysis.completeness_score || 0) * 100)}%
                    </div>
                  </div>
                </div>

                {refineResults.analysis.issues && refineResults.analysis.issues.length > 0 && (
                  <div className="alert alert-warning mb-4">
                    <div>
                      <h5 className="font-semibold">Issues Identified:</h5>
                      <ul className="list-disc list-inside mt-2">
                        {refineResults.analysis.issues.map((issue, index) => (
                          <li key={index} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {refineResults.analysis.suggestions && refineResults.analysis.suggestions.length > 0 && (
                  <div className="alert alert-info">
                    <div>
                      <h5 className="font-semibold">Suggestions:</h5>
                      <ul className="list-disc list-inside mt-2">
                        {refineResults.analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Variants Section */}
            {refineResults.variants && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Prompt Variants</h4>
                <div className="space-y-3">
                  {Object.entries(refineResults.variants).map(([type, content]) => {
                    const evaluation = refineResults.evaluations?.find(e => e.type === type)
                    const isBest = refineResults.best?.type === type
                    
                    return (
                      <div
                        key={type}
                        className={`card bg-base-200 ${isBest ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium capitalize">{type}</h5>
                              {isBest && <div className="badge badge-primary">Best</div>}
                            </div>
                            {evaluation && (
                              <div className="text-sm text-base-content/60">
                                Score: {Math.round(evaluation.score * 100)}%
                              </div>
                            )}
                          </div>
                          <p className="text-sm mb-3">{content}</p>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSelectVariant(content)}
                          >
                            Use This Version
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Processing Info */}
            {refineResults.metadata && (
              <div className="text-xs text-base-content/50 mt-4 text-center">
                Processed in {refineResults.metadata.processing_time_ms}ms using {refineResults.metadata.model_used}
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowRefineModal(false)}
              >
                Keep Original
              </button>
            </div>
          </div>
        </dialog>
      )}

    </div>
  )
}