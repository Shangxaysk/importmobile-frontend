'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    inStock: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gray-200">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Нет фото
            </div>
          )}
          {!product.inStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              Нет в наличии
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600">
              {product.price.toLocaleString()} сум
            </span>
            {product.inStock && (
              <span className="text-green-600 text-sm">В наличии</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
