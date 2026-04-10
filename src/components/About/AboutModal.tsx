import React from 'react';
import { AboutArticle } from '../../types/About'; // Path relative to src/

interface AboutModalProps {
  article: AboutArticle;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ article, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-3xl w-full overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2">&times;</button>
        </div>
        <div className="p-6 pt-0">
          <div className="w-full bg-gray-100 rounded mb-6 flex items-center justify-center overflow-hidden h-[300px] md:h-[450px] border border-gray-200">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4">{article.title}</h2>
          <div className="prose max-w-none">
            {article.content.split('\n').map((para, i) => (
              <p key={i} className="mb-4 text-gray-800 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};