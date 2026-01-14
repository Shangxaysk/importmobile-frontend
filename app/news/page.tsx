import { getNews } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

export default async function NewsPage() {
  let news = []
  try {
    news = await getNews()
  } catch (error) {
    console.error('Error loading news:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Новости</h1>

      {news.length > 0 ? (
        <div className="space-y-6">
          {news.map((item: any) => (
            <Link
              key={item._id}
              href={`/news/${item._id}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="md:flex">
                {item.image && (
                  <div className="relative md:w-64 md:h-48 h-48 bg-gray-200">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Новости не найдены
        </div>
      )}
    </div>
  )
}
