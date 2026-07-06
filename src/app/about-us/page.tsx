'use client';
import React, { useState, useEffect } from 'react';
import { AboutArticle } from '../../types/About';
import { AboutModal } from '../../components/About/AboutModal';

export default function AboutPage() {
  const [articles, setArticles] = useState<AboutArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<AboutArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/about', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  const getFirstParagraph = (text: string) => text.split('\n')[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1C1E' }}>
        <div className="text-center">
          <div
            className="inline-block w-10 h-10 border-4 rounded-full animate-spin mb-4"
            style={{ borderColor: '#F3B340', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#8C8C8C' }}>Loading About Us content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1C1E' }}>
        <div className="text-center py-12">
          <p style={{ color: '#ef4444' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1A1C1E' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Page Header */}
        <div className="mb-10">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
          >
            About Us
          </h1>
          <div className="w-16 h-1 rounded-full" style={{ background: '#F3B340' }} />
          <p className="mt-4 text-lg max-w-2xl" style={{ color: '#E0E0E0' }}>
            Discover the stories, history, and spirit behind Peter Easton&apos;s Pub.
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: '#242628', border: '1px solid rgba(243,179,64,0.12)' }}
          >
            <div className="text-5xl mb-4">⚓</div>
            <p className="text-xl font-semibold mb-2" style={{ color: '#F3B340', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Stories Coming Soon
            </p>
            <p style={{ color: '#8C8C8C' }}>Check back soon for articles about our pub&apos;s history and more.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="pub-card cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Image */}
                <div className="aspect-video overflow-hidden" style={{ backgroundColor: '#2E3033' }}>
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2
                    className="text-lg font-bold mb-2 transition-colors duration-200"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: '#F3B340',
                    }}
                  >
                    {article.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed line-clamp-3 mb-4"
                    style={{ color: '#E0E0E0' }}
                  >
                    {getFirstParagraph(article.content)}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-sm font-semibold transition-all duration-200 group-hover:gap-2"
                    style={{ color: '#F3B340' }}
                  >
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <AboutModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}
