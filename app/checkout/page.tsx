'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCart, createOrder, uploadFile, getProduct } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuthStore();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    additionalPhone: '',
    telegramUsername: '',
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [prepaymentPercentage, setPrepaymentPercentage] = useState(50);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?returnUrl=/checkout');
      return;
    }

    // Если есть productId в query, добавить товар в корзину
    const productId = searchParams.get('productId');
    if (productId && user) {
      getProduct(productId).then((product) => {
        const currentCart = getCart();
        if (!currentCart.find((item: any) => item.productId === productId)) {
          const updatedCart = [...currentCart, { productId, product, quantity: 1 }];
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          setCart(updatedCart);
        } else {
          setCart(currentCart);
        }
      });
    } else {
      setCart(getCart());
    }
  }, [user, isLoading, router, searchParams]);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const prepaymentAmount = (total * prepaymentPercentage) / 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentScreenshot) {
      toast.error('Пожалуйста, загрузите скриншот платежа');
      return;
    }

    setLoading(true);

    try {
      // Загрузить скриншот
      const uploadResult = await uploadFile(paymentScreenshot);

      // Создать заказ
      const orderData = {
        products: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress: formData.deliveryAddress,
        contactPhone: user?.phone || '',
        additionalPhone: formData.additionalPhone || undefined,
        telegramUsername: formData.telegramUsername || undefined,
        paymentScreenshot: uploadResult.url,
        prepaymentPercentage,
      };

      await createOrder(orderData);

      // Очистить корзину
      localStorage.removeItem('cart');

      toast.success('Заказ успешно оформлен!');
      router.push('/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Корзина пуста</p>
          <button
            onClick={() => router.push('/catalog')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Перейти в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Оформление заказа</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Выбранные товары</h2>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between py-2 border-b">
                    <span>
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      {(item.product.price * item.quantity).toLocaleString()} сум
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес доставки *
              </label>
              <textarea
                required
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Алоқа учун рақам
              </label>
              <input
                type="tel"
                value={user?.phone || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Қўшимча рақам
              </label>
              <input
                type="tel"
                value={formData.additionalPhone}
                onChange={(e) => setFormData({ ...formData, additionalPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+998901234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram username
              </label>
              <input
                type="text"
                value={formData.telegramUsername}
                onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Реквизиты для предоплаты
              </label>
              <div className="bg-gray-50 p-4 rounded-lg mb-2">
                <p className="font-mono text-sm">
                  Карта: 8600 1234 5678 9012
                  <br />
                  Получатель: Имя Фамилия
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Сумма предоплаты: <strong>{prepaymentAmount.toLocaleString()} сум</strong> (
                {prepaymentPercentage}%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Скриншот перевода *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {screenshotPreview && (
                <div className="mt-2">
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Пожалуйста, не присылайте фальшивые чеки. Мы проверяем каждую транзакцию.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Продолжить'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Итого</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Товары</span>
                <span>{total.toLocaleString()} сум</span>
              </div>
              <div className="flex justify-between text-primary-600">
                <span>Предоплата ({prepaymentPercentage}%)</span>
                <span>{prepaymentAmount.toLocaleString()} сум</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>К оплате</span>
                <span>{prepaymentAmount.toLocaleString()} сум</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
