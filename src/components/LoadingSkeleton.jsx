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
    <div className="bg-base-200 rounded-lg shadow-lg p-6 border border-base-300">
      {/* Title skeleton */}
      <div className="skeleton h-6 w-3/4 mb-4"></div>
      
      {/* Content skeleton */}
      <div className="skeleton h-4 w-full mb-2"></div>
      <div className="skeleton h-4 w-full mb-2"></div>
      <div className="skeleton h-4 w-2/3 mb-4"></div>
      
      {/* Categories skeleton */}
      <div className="flex gap-2 mb-2">
        <div className="skeleton h-5 w-16"></div>
        <div className="skeleton h-5 w-12"></div>
        <div className="skeleton h-5 w-20"></div>
      </div>
      
      {/* Models skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 w-14"></div>
        <div className="skeleton h-5 w-18"></div>
      </div>
      
      {/* Metadata skeleton */}
      <div className="skeleton h-3 w-1/2 mb-4"></div>
      
      {/* Actions skeleton */}
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-16"></div>
        <div className="skeleton h-8 w-16"></div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  }

  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
    </div>
  )
}