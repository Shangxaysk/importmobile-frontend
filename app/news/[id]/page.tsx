import { getNewsItem } from '@/lib/api'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function NewsItemPage({ params }: { params: { id: string } }) {
  try {
    const news = await getNewsItem(params.id)

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            {new Date(news.createdAt).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {news.image && (
            <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="prose max-w-none">
            <p className="whitespace-pre-line text-gray-700 leading-relaxed">
              {news.content}
            </p>
          </div>
        </article>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
