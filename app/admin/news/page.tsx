'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getNews } from '@/lib/api';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AdminNewsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }

    if (user?.isAdmin) {
      loadNews();
    }
  }, [user, isLoading, router]);

  const loadNews = async () => {
    try {
      const data = await getNews();
      setNews(data);
    } catch (error) {
      toast.error('Ошибка загрузки новостей');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await api.put(`/api/news/${editingNews._id}`, formData);
        toast.success('Новость обновлена');
      } else {
        await api.post('/api/news', formData);
        toast.success('Новость создана');
      }
      setShowForm(false);
      setEditingNews(null);
      setFormData({ title: '', content: '' });
      loadNews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка сохранения новости');
    }
  };

  const handleEdit = (newsItem: any) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить новость?')) return;

    try {
      await api.delete(`/api/news/${id}`);
      toast.success('Новость удалена');
      loadNews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка удаления новости');
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
        <h1 className="text-3xl font-bold">Управление новостями</h1>
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
              setEditingNews(null);
              setFormData({ title: '', content: '' });
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {showForm ? 'Отмена' : 'Добавить новость'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingNews ? 'Редактировать новость' : 'Новая новость'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержание *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={10}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {editingNews ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Список новостей</h2>
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.content}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
        {news.length === 0 && (
          <p className="text-gray-600 text-center py-8">Новостей нет</p>
        )}
      </div>
    </div>
  );
}
