'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProduct, addToCart } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-toastify';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(params.id as string);
        setProduct(data);
      } catch (error) {
        toast.error('Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!user) {
      const returnUrl = `/products/${params.id}`;
      router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}&action=addToCart`);
      return;
    }

    addToCart(product);
    toast.success('Добавлено в корзину', { autoClose: 5000 });
  };

  const handleCheckout = () => {
    if (!user) {
      const returnUrl = `/products/${params.id}`;
      router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}&action=checkout`);
      return;
    }

    addToCart(product);
    router.push(`/checkout?productId=${product._id}`);
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Товар не найден</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-96 bg-gray-200">
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
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="mb-4">
            <span className="text-3xl font-bold text-primary-600">
              {product.price.toLocaleString()} сум
            </span>
          </div>
          <div className="mb-6">
            <span
              className={`inline-block px-3 py-1 rounded ${
                product.inStock
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Описание</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {product.inStock && (
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Добавить в корзину
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Оформить заказ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
