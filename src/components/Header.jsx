import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useFeed } from '../context/FeedContext.jsx'
import AuthDialog from './AuthDialog.jsx'

const categories = [
  'All',
  'Creative Writing',
  'Code Generation',
  'Analysis',
  'Education',
  'Business',
  'Research',
  'Fun'
]

const languages = [
  'All',
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese'
]

export default function Header() {
  const { user, signOut } = useAuth()
  const { filters, updateFilters } = useFeed()
  const location = useLocation()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e) => {
    updateFilters({ q: e.target.value })
  }

  const handleCategoryChange = (category) => {
    updateFilters({ category: category === 'All' ? '' : category })
  }

  const handleLanguageChange = (e) => {
    updateFilters({ language: e.target.value === 'All' ? '' : e.target.value })
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <>
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
              <span className="text-blue-400">Prompt</span>
              <span className="text-purple-400">Gallery</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-2">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/' 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Feed
                </Link>
                <Link 
                  to="/favorites" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/favorites' 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Favorites
                </Link>
              </div>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button 
                    className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user.email}
                      </div>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleSignOut}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search prompts..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 search-input"
                value={filters.q}
                onChange={handleSearch}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Language Filter */}
            <select 
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.language || 'All'}
              onChange={handleLanguageChange}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  (category === 'All' && !filters.category) || filters.category === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </>
  )
}