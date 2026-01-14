'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getAllOrders, updateOrderStatus, requestPassportData, addPassportData } from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  pending_payment: 'Ожидает проверки платежа',
  payment_verified: 'Платёж подтверждён',
  passport_requested: 'Запрошены паспортные данные',
  passport_verified: 'Паспортные данные получены',
  confirmed: 'Заказ оформлен',
  rejected: 'Отклонён',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [passportData, setPassportData] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }

    if (user?.isAdmin) {
      loadOrders();
    }
  }, [user, isLoading, router]);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Статус обновлён');
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка обновления статуса');
    }
  };

  const handleRequestPassport = async (orderId: string) => {
    try {
      await requestPassportData(orderId);
      toast.success('Запрос на паспортные данные отправлен');
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка отправки запроса');
    }
  };

  const handleAddPassport = async (orderId: string) => {
    if (!passportData.trim()) {
      toast.error('Введите паспортные данные');
      return;
    }

    try {
      await addPassportData(orderId, passportData);
      toast.success('Паспортные данные добавлены');
      setSelectedOrder(null);
      setPassportData('');
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка добавления данных');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Админ-панель</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Управление товарами
          </Link>
          <Link
            href="/admin/news"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Управление новостями
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Заказы</h2>

        {orders.length === 0 ? (
          <p className="text-gray-600">Заказов нет</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Заказ #{order._id.slice(-8)}</h3>
                    <p className="text-sm text-gray-500">
                      Пользователь: {order.user?.phone || 'N/A'}
                    </p>
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
                  <h4 className="font-semibold mb-2">Товары:</h4>
                  <ul className="space-y-1">
                    {order.products.map((item: any, idx: number) => (
                      <li key={idx} className="text-sm">
                        {item.product?.name || 'Товар удалён'} x{item.quantity} -{' '}
                        {(item.price * item.quantity).toLocaleString()} сум
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Адрес:</span>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Телефон:</span>
                    <p className="font-medium">{order.contactPhone}</p>
                  </div>
                </div>

                {order.paymentScreenshot && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Скриншот платежа:</p>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${order.paymentScreenshot}`}
                      alt="Payment screenshot"
                      className="max-w-xs rounded border"
                    />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending_payment' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(order._id, 'payment_verified')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Подтвердить платёж
                      </button>
                      <button
                        onClick={() => handleStatusChange(order._id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Отклонить
                      </button>
                    </>
                  )}

                  {order.status === 'payment_verified' && (
                    <button
                      onClick={() => handleRequestPassport(order._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Запросить паспортные данные
                    </button>
                  )}

                  {order.status === 'passport_requested' && (
                    <>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Добавить паспортные данные
                      </button>
                    </>
                  )}

                  {order.status === 'passport_verified' && (
                    <button
                      onClick={() => handleStatusChange(order._id, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Подтвердить заказ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно для добавления паспортных данных */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Паспортные данные для заказа #{selectedOrder._id.slice(-8)}
            </h3>
            <textarea
              value={passportData}
              onChange={(e) => setPassportData(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              rows={5}
              placeholder="Введите паспортные данные..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleAddPassport(selectedOrder._id)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setPassportData('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
