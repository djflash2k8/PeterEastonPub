// c:\Users\jonat\Documents\Peter Easton\src\app\admin\about\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AboutArticle } from '../../../types/About'; // Path relative to src/app/admin/about

export default function AboutAdminPage() {
  const [articles, setArticles] = useState<AboutArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<AboutArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AboutArticle, 'id' | 'createdAt'>>({ title: '', content: '', imageUrl: '', updatedAt: new Date().toISOString() });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Update local preview when a new file is selected
  useEffect(() => {
    if (!selectedFile) {
      setLocalPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    fetchArticles(); // Initial fetch when component mounts
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/about');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      const data: AboutArticle[] = await response.json();
      setArticles(data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch articles. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      let currentImageUrl = form.imageUrl;

      // 1. Handle file upload if a new file was selected
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const { url } = await uploadRes.json();
        currentImageUrl = url;
      }

      const payload = { ...form, imageUrl: currentImageUrl };

      let response;
      if (editingArticle && editingArticle.id !== 'new') { // If editingArticle is not null and not a dummy new ID, it's an update
        response = await fetch(`/api/about?id=${editingArticle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/about', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      await fetchArticles(); // Re-fetch articles to update the list
      setEditingArticle(null);
      setSelectedFile(null);
      setForm({ title: '', content: '', imageUrl: '', updatedAt: new Date().toISOString() }); // Clear form after successful save
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save article. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (article: AboutArticle) => {
    setEditingArticle({
      id: article.id,
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    });
    setForm({
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl || '',
      updatedAt: article.updatedAt
    });
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }
    try {
      const response = await fetch(`/api/about?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      await fetchArticles(); // Re-fetch articles to update the list
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete article. Please check your connection.');
    }
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
    setSelectedFile(null);
    setForm({ title: '', content: '', imageUrl: '', updatedAt: new Date().toISOString() }); // Clear form on cancel
  };

  return (
    <div className="p-8 text-black">
      <div className="mb-4">
        <a className="text-blue-500 hover:underline font-bold" href="/admin">← Back to Dashboard</a>
      </div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage About Page</h1>
        <button
          onClick={() => {
            setForm({ title: '', content: '', imageUrl: '', updatedAt: new Date().toISOString() }); // Clear form for new article
            setEditingArticle({ id: 'new', title: '', content: '', imageUrl: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); // Set a temporary article object to make the form visible for creation
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create New Article
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {isLoading && <div className="text-center py-4">Loading articles...</div>}

      {/* Form for adding/editing articles */}
      {editingArticle && (
        <form onSubmit={handleSave} className="mb-8 bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">{editingArticle.id === 'new' ? 'Add New Article' : 'Edit Article'}</h2>
          <div className="grid gap-4">
            <input
              type="text" placeholder="Title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="p-2 border rounded" required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold">Article Image</label>
              {(localPreview || form.imageUrl) && (
                <div className="mb-4">
                  <div className="w-full max-w-sm h-48 border rounded overflow-hidden flex items-center justify-center bg-gray-50 shadow-inner">
                    <img 
                      src={localPreview || form.imageUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  {!localPreview && <div className="text-xs text-gray-500 mt-1 italic">Current image: {form.imageUrl}</div>}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="p-2 border rounded bg-white"
              />
            </div>
            <textarea
              placeholder="Content (use new lines for paragraphs)" value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="p-2 border rounded h-40" required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Article List */}
      <div className="bg-white border rounded-lg">
        {!isLoading && articles.length === 0 && <p className="p-4 text-gray-500">No About Us articles found. Create one!</p>}
        {!isLoading && articles.map(article => (
          <div key={article.id} className="flex items-center justify-between p-4 border-b last:border-0">
            <div className="flex items-center gap-4 flex-1">
              {article.imageUrl && (
                <div className="w-20 h-16 border rounded overflow-hidden flex items-center justify-center bg-gray-50 shadow-inner flex-shrink-0">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <span className="font-medium">{article.title}</span>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(article.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(article)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
