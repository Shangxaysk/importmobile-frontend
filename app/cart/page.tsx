'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, removeFromCart, updateCartItem, clearCart } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?returnUrl=/cart');
      return;
    }

    setCart(getCart());
  }, [user, isLoading, router]);

  const handleRemove = (productId: string) => {
    setCart(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart(updateCartItem(productId, quantity));
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Корзина</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Ваша корзина пуста</p>
          <Link
            href="/catalog"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-lg shadow-md p-4 flex gap-4"
            >
              <div className="relative w-24 h-24 bg-gray-200 rounded flex-shrink-0">
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    Нет фото
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-semibold text-lg hover:text-primary-600"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-600 text-sm mb-2">{item.product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {(item.product.price * item.quantity).toLocaleString()} сум
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Итого</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Товары ({cart.length})</span>
                <span>{total.toLocaleString()} сум</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Всего</span>
                <span>{total.toLocaleString()} сум</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Оформить заказ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
