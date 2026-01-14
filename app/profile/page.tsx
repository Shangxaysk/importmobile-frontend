'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?returnUrl=/profile');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Номер телефона
          </label>
          <input
            type="tel"
            value={user.phone}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
          />
        </div>

        {user.telegramUsername && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram username
            </label>
            <input
              type="text"
              value={user.telegramUsername}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <Link
            href="/orders"
            className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold mb-4"
          >
            Мои заказы
          </Link>

          <button
            onClick={logout}
            className="block w-full text-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
