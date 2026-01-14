import { getProducts } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

export default async function CatalogPage() {
  let products = []
  try {
    products = await getProducts()
  } catch (error) {
    console.error('Error loading products:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Каталог товаров</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Товары не найдены
        </div>
      )}
    </div>
  )
}
