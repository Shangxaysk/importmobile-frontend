'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, checkAuth, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            ImportMobile
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/catalog"
              className={`px-3 py-2 rounded ${pathname === '/catalog' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Каталог
            </Link>
            <Link
              href="/news"
              className={`px-3 py-2 rounded ${pathname === '/news' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Новости
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/cart"
                      className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Корзина
                    </Link>
                    <Link
                      href="/profile"
                      className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Профиль
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Админ
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Войти
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
