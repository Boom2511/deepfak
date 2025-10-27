'use client';

import React from 'react';
import Image from 'next/image';
import { Zap, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeatmapRegion {
  name: string;
  attention: number;
  [key: string]: unknown;
}

interface HeatmapAnalysis {
  is_fake: boolean;
  regions: HeatmapRegion[];
  suspicious_regions: HeatmapRegion[];
  top_3_regions: HeatmapRegion[];
  explanation: {
    summary_th: string;
    summary_en: string;
    details_th: string[];
    specific_explanation: string;
  };
  hotspot: {
    x: number;
    y: number;
    value: number;
  };
  overall_attention: number;
  max_attention_value: number;
}

interface HeatmapViewerProps {
  originalImage: string;
  heatmapImage: string;
  isFake: boolean;
  heatmapAnalysis?: HeatmapAnalysis | null;
}

export default function HeatmapViewer({ originalImage, heatmapImage, isFake }: HeatmapViewerProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg overflow-hidden border border-indigo-100">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            {t('heatmap.gradcam_title')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t('heatmap.subtitle')}
          </p>
        </div>

        {/* Side-by-Side Image Display */}
        <div className={`rounded-lg overflow-hidden border-2 ${
          isFake ? 'border-red-300' : 'border-green-300'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-gray-900">
            <div className="relative">
              <Image
                src={originalImage}
                alt="Original"
                width={500} // Added width prop
                height={500} // Added height prop
                className="w-full h-auto object-contain"
              />
              <div className="absolute top-2 left-2 px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded">
                {t('heatmap.original')}
              </div>
            </div>
            <div className="relative">
              <Image
                src={heatmapImage}
                alt="Heatmap"
                width={500} // Added width prop
                height={500} // Added height prop
                className="w-full h-auto object-contain"
              />
              <div className="absolute top-2 left-2 px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded">
                {t('heatmap.attention')}
              </div>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('heatmap.legend')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">{t('heatmap.legend.cool')}</div>
                <div className="text-xs text-gray-500">{t('heatmap.legend.cool.desc')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">{t('heatmap.legend.green')}</div>
                <div className="text-xs text-gray-500">{t('heatmap.legend.green.desc')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">{t('heatmap.legend.yellow')}</div>
                <div className="text-xs text-gray-500">{t('heatmap.legend.yellow.desc')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">{t('heatmap.legend.red')}</div>
                <div className="text-xs text-gray-500">{t('heatmap.legend.red.desc')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className={`mt-6 rounded-lg p-5 border-2 ${
          isFake ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isFake ? 'bg-red-100' : 'bg-green-100'}`}>
              <Eye className={`w-5 h-5 ${isFake ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${isFake ? 'text-red-900' : 'text-green-900'}`}>
                {t('heatmap.interpret.title')}
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>{t('heatmap.interpret.what_seeing')}</p>
                <p>{t('heatmap.interpret.red_areas')}</p>
                <p>{t('heatmap.interpret.green_areas')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info (collapsible) */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
            {t('heatmap.technical.title')} ▼
          </summary>
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-4 space-y-1">
            <p>• {t('heatmap.technical.gradcam')}</p>
            <p>• {t('heatmap.technical.ensemble')}</p>
            <p>• {t('heatmap.technical.regions')}</p>
          </div>
        </details>
      </div>
    </div>
  );
}