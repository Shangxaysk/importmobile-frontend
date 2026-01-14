'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Ошибка</h1>
      <p className="text-gray-600 mb-8">{error.message || 'Произошла ошибка'}</p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Попробовать снова
      </button>
    </div>
  )
}
