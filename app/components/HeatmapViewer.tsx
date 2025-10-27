'use client';

import React from 'react';
import Image from 'next/image';
import { Zap, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeatmapRegion {
  name: string;
  name_th?: string;
  name_en?: string;
  region_id?: string;
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

export default function HeatmapViewer({ originalImage, heatmapImage, isFake, heatmapAnalysis }: HeatmapViewerProps) {
  const { t, language } = useLanguage();

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

        {/* Top 3 Regions Analysis - Detailed Explanation */}
        {heatmapAnalysis && heatmapAnalysis.top_3_regions && heatmapAnalysis.top_3_regions.length > 0 && (
          <div className={`mt-6 rounded-lg p-5 border-2 ${
            isFake
              ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${isFake ? 'bg-orange-100' : 'bg-green-100'}`}>
                <Eye className={`w-5 h-5 ${isFake ? 'text-orange-600' : 'text-green-600'}`} />
              </div>
              <h4 className={`text-base font-bold ${isFake ? 'text-orange-900' : 'text-green-900'}`}>
                {language === 'th'
                  ? (isFake ? 'บริเวณที่ตรวจพบความผิดปกติ (Top 3)' : 'บริเวณที่โมเดลให้ความสนใจ (Top 3)')
                  : (isFake ? 'Top 3 Suspicious Regions' : 'Top 3 Attention Regions')
                }
              </h4>
            </div>

            {/* Summary */}
            {heatmapAnalysis.explanation && (
              <div className={`mb-4 p-4 rounded-lg border-2 ${
                isFake ? 'bg-white border-orange-200' : 'bg-white border-green-200'
              }`}>
                <p className="text-sm font-medium text-gray-800 mb-2">
                  {language === 'th'
                    ? heatmapAnalysis.explanation.summary_th
                    : heatmapAnalysis.explanation.summary_en
                  }
                </p>
              </div>
            )}

            {/* Detailed Region Analysis */}
            <div className="space-y-3">
              {heatmapAnalysis.explanation && heatmapAnalysis.explanation.details_th && heatmapAnalysis.explanation.details_th.map((detail, idx) => {
                const region = heatmapAnalysis.top_3_regions[idx];
                if (!region) return null;

                // Parse the detail text (format: "🔴 **ตาซ้าย**: ระดับความสนใจ 85.3% - คำอธิบาย...")
                const detailText = language === 'th' ? detail : detail; // Use same for now, backend only has TH

                // Determine icon based on attention level
                const attentionLevel = region.attention || 0;
                const isHighAttention = attentionLevel >= 0.6;

                return (
                  <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-3">
                      {/* Number Badge */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-sm ${
                        isFake
                          ? 'bg-gradient-to-br from-orange-400 to-red-500'
                          : 'bg-gradient-to-br from-green-400 to-emerald-500'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Region Info */}
                      <div className="flex-1 min-w-0">
                        {/* Region Name */}
                        <div className="flex items-center gap-2 mb-2">
                          {isFake && isHighAttention ? (
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-gray-900">
                            {language === 'th' ? region.name_th || region.name : region.name_en || region.name}
                          </span>
                        </div>

                        {/* Attention Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>{language === 'th' ? 'ระดับความสนใจ' : 'Attention Level'}</span>
                            <span className="font-semibold">{(attentionLevel * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFake
                                  ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                  : 'bg-gradient-to-r from-green-400 to-emerald-500'
                              }`}
                              style={{ width: `${attentionLevel * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Explanation Text */}
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {detailText.replace(/^[🔴⚠️✅]\s*\*\*[^*]+\*\*:\s*[^-]+-\s*/, '')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Specific Explanation */}
            {heatmapAnalysis.explanation && heatmapAnalysis.explanation.specific_explanation && (
              <div className={`mt-4 p-3 rounded-lg border ${
                isFake ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <p className="text-xs text-gray-700 italic">
                  💡 {heatmapAnalysis.explanation.specific_explanation}
                </p>
              </div>
            )}
          </div>
        )}

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