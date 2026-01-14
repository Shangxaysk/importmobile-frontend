'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const statusLabels: Record<string, string> = {
  pending_payment: 'Ожидает проверки платежа',
  payment_verified: 'Платёж подтверждён',
  passport_requested: 'Запрошены паспортные данные',
  passport_verified: 'Паспортные данные получены',
  confirmed: 'Заказ оформлен',
  rejected: 'Отклонён',
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?returnUrl=/orders');
      return;
    }

    if (user) {
      loadOrders();
    }
  }, [user, isLoading, router]);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">У вас пока нет заказов</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Заказ #{order._id.slice(-8)}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    order.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Товары:</h3>
                <ul className="space-y-1">
                  {order.products.map((item: any, idx: number) => (
                    <li key={idx} className="text-gray-700">
                      {item.product?.name || 'Товар удалён'} x{item.quantity} -{' '}
                      {(item.price * item.quantity).toLocaleString()} сум
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Адрес:</span>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
                <div>
                  <span className="text-gray-600">Телефон:</span>
                  <p className="font-medium">{order.contactPhone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Предоплата:</span>
                  <p className="font-medium">
                    {order.prepaymentAmount.toLocaleString()} сум ({order.prepaymentPercentage}%)
                  </p>
                </div>
              </div>

              {order.status === 'pending_payment' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ⏳ Менторы проверяют платёж. Проверка может занять до 1 рабочего дня.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
