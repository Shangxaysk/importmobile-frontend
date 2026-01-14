'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getProducts } from '@/lib/api';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inStock: true,
  });

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }

    if (user?.isAdmin) {
      loadProducts();
    }
  }, [user, isLoading, router]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, {
          ...formData,
          price: parseFloat(formData.price),
        });
        toast.success('Товар обновлён');
      } else {
        await api.post('/api/products', {
          ...formData,
          price: parseFloat(formData.price),
        });
        toast.success('Товар создан');
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', inStock: true });
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка сохранения товара');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      inStock: product.inStock,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;

    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Товар удалён');
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка удаления товара');
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
        <h1 className="text-3xl font-bold">Управление товарами</h1>
        <div className="flex gap-4">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Назад
          </Link>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
              setFormData({ name: '', description: '', price: '', inStock: true });
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {showForm ? 'Отмена' : 'Добавить товар'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Редактировать товар' : 'Новый товар'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена (сум) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                />
                <span>В наличии</span>
              </label>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {editingProduct ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Список товаров</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="border rounded-lg p-4 flex gap-4">
              <div className="relative w-24 h-24 bg-gray-200 rounded flex-shrink-0">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
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
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{product.price.toLocaleString()} сум</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-gray-600 text-center py-8">Товаров нет</p>
        )}
      </div>
    </div>
  );
}
