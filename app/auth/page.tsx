'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { register, login } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-toastify';
import { addToCart } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: loginStore } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const returnUrl = searchParams.get('returnUrl') || '/';
  const action = searchParams.get('action'); // 'addToCart' or 'checkout'
  const productId = searchParams.get('productId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await login(formData.phone, formData.password);
      } else {
        response = await register(formData.phone, formData.password);
      }

      await loginStore(response.token);

      // Обработка редиректа после входа
      if (action === 'addToCart' && productId) {
        // Добавить товар в корзину и вернуться к товару
        try {
          const { getProduct } = await import('@/lib/api');
          const product = await getProduct(productId);
          addToCart(product);
          toast.success('Добавлено в корзину', { autoClose: 5000 });
          router.push(returnUrl);
        } catch (error) {
          router.push(returnUrl);
        }
      } else if (action === 'checkout' && productId) {
        // Добавить товар в корзину и перейти к оформлению
        try {
          const { getProduct } = await import('@/lib/api');
          const product = await getProduct(productId);
          addToCart(product);
          router.push(`/checkout?productId=${productId}`);
        } catch (error) {
          router.push('/checkout');
        }
      } else {
        router.push(returnUrl);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Номер телефона
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+998901234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={isLogin ? 'Введите пароль' : 'Минимум 5 символов'}
              minLength={isLogin ? undefined : 5}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Пароль должен содержать минимум 5 символов
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-600 hover:underline"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
