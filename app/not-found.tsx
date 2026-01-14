import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-8">Страница не найдена</p>
      <Link
        href="/"
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Вернуться на главную
      </Link>
    </div>
  )
}
