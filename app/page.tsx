import Link from 'next/link'
import { getProducts } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

export default async function Home() {
  let products = []
  try {
    products = await getProducts()
  } catch (error) {
    console.error('Error loading products:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ImportMobile
        </h1>
        <p className="text-lg text-gray-600">
          Добро пожаловать в наш маркетплейс
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <Link
          href="/catalog"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Каталог товаров
        </Link>
        <Link
          href="/news"
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Новости
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Популярные товары</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Товары не найдены</p>
        )}
      </div>
    </div>
  )
}
