'use client';
import React, { useState, useEffect } from 'react';
import { AboutArticle } from '../../types/About'; // Path relative to src/
import { AboutModal } from '../../components/About/AboutModal'; // Path relative to src/

export default function AboutPage() {
  const [articles, setArticles] = useState<AboutArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<AboutArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/about', { cache: 'no-store' }); // Bypass cache for fresh data
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AboutArticle[] = await response.json();
        setArticles(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch articles.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const getFirstParagraph = (text: string) => {
    return text.split('\n')[0];
  };

  if (isLoading) return <div className="text-center py-12">Loading About Us content...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold mb-12 text-center">About Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="cursor-pointer group border rounded-lg overflow-hidden transition-shadow hover:shadow-xl bg-white"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="aspect-video overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3 group-hover:text-blue-600">{article.title}</h2>
              <p className="text-gray-600 line-clamp-3">
                {getFirstParagraph(article.content)}
              </p>
              <span className="mt-4 inline-block text-blue-500 font-semibold group-hover:underline">
                Read More &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <AboutModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}