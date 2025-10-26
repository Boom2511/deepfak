'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, ImageIcon, Lightbulb, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function UploadAssistant() {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{t('assistant.title')}</h3>
      </div>

      <div className="space-y-6">
        {/* Best Practices */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            {t('assistant.best_practices')}
          </h4>
          <div className="space-y-2 text-sm text-gray-700 ml-7">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>{t('assistant.best_practices.resolution')}</strong> {t('assistant.best_practices.resolution.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>{t('assistant.best_practices.clear')}</strong> {t('assistant.best_practices.clear.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>{t('assistant.best_practices.original')}</strong> {t('assistant.best_practices.original.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>{t('assistant.best_practices.front')}</strong> {t('assistant.best_practices.front.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>{t('assistant.best_practices.single')}</strong> {t('assistant.best_practices.single.desc')}</span>
            </div>
          </div>
        </div>

        {/* What to Avoid */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            {t('assistant.avoid')}
          </h4>
          <div className="space-y-2 text-sm text-gray-700 ml-7">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>{t('assistant.avoid.compression')}</strong> {t('assistant.avoid.compression.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>{t('assistant.avoid.angles')}</strong> {t('assistant.avoid.angles.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>{t('assistant.avoid.filters')}</strong> {t('assistant.avoid.filters.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>{t('assistant.avoid.obstructions')}</strong> {t('assistant.avoid.obstructions.desc')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>{t('assistant.avoid.lowlight')}</strong> {t('assistant.avoid.lowlight.desc')}</span>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">{t('assistant.formats')}</div>
              <div className="text-blue-800">
                {t('assistant.formats.list')}
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-indigo-900 mb-2">{t('assistant.tips')}</div>
              <div className="text-indigo-800 space-y-1">
                <div>• {t('assistant.tips.batch')}</div>
                <div>• {t('assistant.tips.compare')}</div>
                <div>• {t('assistant.tips.heatmap')}</div>
                <div>• {t('assistant.tips.confidence')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>{t('assistant.privacy')}</span>
        </div>
      </div>
    </div>
  );
}
