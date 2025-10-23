export default function ErrorState({ title, description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 mb-6 text-error">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-base-content mb-2">
        {title || 'Something went wrong'}
      </h3>
      
      <p className="text-base-content/60 max-w-md mb-6">
        {description || 'We encountered an error while loading the content. Please try again.'}
      </p>
      
      {onRetry && (
        <button 
          className="btn btn-primary"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  )
}