export default function EmptyState({ title, description, icon, actionButton }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-24 h-24 mb-6 text-gray-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-400 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {actionButton && actionButton}
    </div>
  )
}

export function EmptyPrompts() {
  return (
    <EmptyState
      title="No prompts found"
      description="There are no prompts matching your current filters. Try adjusting your search criteria or browse all prompts."
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      }
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      title="No favorites yet"
      description="Start exploring and liking prompts to build your personal collection. Your favorite prompts will appear here."
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
    />
  )
}