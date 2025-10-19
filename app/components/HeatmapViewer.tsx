'use client';

import React from 'react';
import { Zap, Eye } from 'lucide-react';

interface HeatmapViewerProps {
  originalImage: string;
  heatmapImage: string;
  isFake: boolean;
}

export default function HeatmapViewer({ originalImage, heatmapImage, isFake }: HeatmapViewerProps) {

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg overflow-hidden border border-indigo-100">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Grad-CAM Attention Heatmap
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Visual explanation of AI decision-making process
          </p>
        </div>

        {/* Side-by-Side Image Display */}
        <div className={`rounded-lg overflow-hidden border-2 ${
          isFake ? 'border-red-300' : 'border-green-300'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-gray-900">
            <div className="relative">
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-auto object-contain"
              />
              <div className="absolute top-2 left-2 px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded">
                Original
              </div>
            </div>
            <div className="relative">
              <img
                src={heatmapImage}
                alt="Heatmap"
                className="w-full h-auto object-contain"
              />
              <div className="absolute top-2 left-2 px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded">
                Attention Heatmap
              </div>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Color Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">Cool (Blue)</div>
                <div className="text-xs text-gray-500">Low attention</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">Green</div>
                <div className="text-xs text-gray-500">Normal</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">Yellow</div>
                <div className="text-xs text-gray-500">Moderate</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded shadow-inner" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}></div>
              <div>
                <div className="text-xs font-medium text-gray-900">Red</div>
                <div className="text-xs text-gray-500">High attention</div>
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
                How to Interpret This Heatmap
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>What you're seeing:</strong> This Grad-CAM (Gradient-weighted Class Activation Mapping)
                  visualization shows which regions of the image were most influential in the AI's decision.
                </p>
                {isFake ? (
                  <>
                    <p>
                      <strong>Red/warm areas:</strong> Regions where the model detected patterns consistent
                      with AI-generated or manipulated content. These areas showed the strongest signals of manipulation.
                    </p>
                    <p>
                      <strong>Common patterns:</strong> Deepfakes often show artifacts around facial boundaries,
                      inconsistent lighting, or unnatural texture transitions - look for these in highlighted areas.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Green/cool areas:</strong> The model found natural patterns consistent with
                      authentic imagery. Attention is distributed normally across facial features.
                    </p>
                    <p>
                      <strong>What's normal:</strong> Authentic photos typically show even distribution
                      with slight emphasis on eyes, mouth, and edges - which is what we see here.
                    </p>
                  </>
                )}
                <p className="pt-2 border-t border-gray-300">
                  <strong>Note:</strong> This is a visual aid to understand the AI's reasoning.
                  The final prediction combines analysis from multiple models and factors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info (collapsible) */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Technical Details ▼
          </summary>
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-4 space-y-1">
            <p>• <strong>Method:</strong> Grad-CAM (Gradient-weighted Class Activation Mapping)</p>
            <p>• <strong>Model:</strong> Convolutional Neural Network with attention visualization</p>
            <p>• <strong>Layer:</strong> Final convolutional layer activations</p>
            <p>• <strong>Resolution:</strong> 224x224 (upscaled for display)</p>
            <p>• <strong>Purpose:</strong> Explainable AI - show reasoning behind predictions</p>
          </div>
        </details>
      </div>
    </div>
  );
}
