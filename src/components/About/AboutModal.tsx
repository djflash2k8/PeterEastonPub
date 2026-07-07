import React from 'react';
import { AboutArticle } from '../../types/About';

interface AboutModalProps {
  article: AboutArticle;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ article, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#1A1C1E',
          border: '1px solid rgba(243, 179, 64, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
          style={{
            backgroundColor: 'rgba(243, 179, 64, 0.12)',
            color: '#F3B340',
            border: '1px solid rgba(243, 179, 64, 0.3)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(243, 179, 64, 0.25)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(243, 179, 64, 0.12)'
          }}
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div
          className="w-full flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: '#242628',
            height: '320px',
            borderBottom: '1px solid rgba(243, 179, 64, 0.12)',
          }}
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="max-w-full max-h-full object-contain"
            style={{ padding: '1rem' }}
          />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#F3B340',
            }}
          >
            {article.title}
          </h2>
          <div className="w-12 h-0.5 rounded-full mb-5" style={{ background: '#F3B340' }} />
          <div className="space-y-4">
            {article.content.split('\n').map((para, i) =>
              para.trim() ? (
                <p key={i} className="leading-relaxed" style={{ color: '#E0E0E0' }}>
                  {para}
                </p>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
