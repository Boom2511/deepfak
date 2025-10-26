'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-2">
      <Languages className="w-4 h-4 text-gray-600" />
      <button
        onClick={() => setLanguage('th')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
          language === 'th'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        TH
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}
