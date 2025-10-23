export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Title skeleton */}
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
      
      {/* Content skeleton */}
      <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded w-2/3 mb-4 animate-pulse"></div>
      
      {/* Categories skeleton */}
      <div className="flex gap-2 mb-2">
        <div className="h-5 bg-gray-700 rounded w-16 animate-pulse"></div>
        <div className="h-5 bg-gray-700 rounded w-12 animate-pulse"></div>
        <div className="h-5 bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>
      
      {/* Models skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-700 rounded w-14 animate-pulse"></div>
        <div className="h-5 bg-gray-700 rounded w-18 animate-pulse"></div>
      </div>
      
      {/* Metadata skeleton */}
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
      
      {/* Actions skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
        <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin`}></div>
    </div>
  )
}