import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useFeed } from '../context/FeedContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import AuthDialog from './AuthDialog.jsx'
import isologo from '../assets/isologo.png'

const categories = [
  'All',
  'Image Generation',
  'Video Generation',
  'Cars',
  'Sells',
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
  const { theme, toggleTheme } = useTheme()
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
      <header className="bg-base-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
                <img src={isologo} alt="Logo" className="w-8 h-8" />
              <span className="text-lg">Prompt Gallery</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-2">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/' 
                      ? 'bg-base-300 text-base-content' 
                      : 'text-base-content hover:bg-base-300'
                  }`}
                >
                  Feed
                </Link>
                <Link 
                  to="/favorites" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/favorites' 
                      ? 'bg-base-300 text-base-content' 
                      : 'text-base-content hover:bg-base-300'
                  }`}
                >
                  Favorites
                </Link>
              </div>

              {/* Create Button */}
              <Link 
                to="/create"
                className={`btn btn-sm gap-2 ${
                  location.pathname === '/create'
                    ? 'btn-primary'
                    : 'btn-outline btn-primary'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Create</span>
              </Link>

              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-base-300 hover:bg-base-100 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button 
                    className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center hover:bg-primary-focus transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg py-1 z-50 border border-base-300">
                      <div className="px-4 py-2 text-sm text-base-content border-b border-base-300">
                        {user.email}
                      </div>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200"
                        onClick={handleSignOut}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="bg-primary hover:bg-primary-focus text-primary-content px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
      {location.pathname === '/' && (
        <div className="bg-base-200 border-b border-base-300">
          <div className="container mx-auto px-4 py-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search prompts..."
                  className="input w-full bg-base-100 border-base-300 text-base-content placeholder-base-content/50 focus:border-primary"
                  value={filters.q}
                  onChange={handleSearch}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Language Filter */}
              <select 
                className="select bg-base-100 border-base-300 text-base-content focus:border-primary"
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
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-300 text-base-content hover:bg-base-100'
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </>
  )
}