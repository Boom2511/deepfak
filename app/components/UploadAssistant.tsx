'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, ImageIcon, Lightbulb, Lock } from 'lucide-react';

export default function UploadAssistant() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Upload Assistant</h3>
      </div>

      <div className="space-y-6">
        {/* Best Practices */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Best Practices for Accurate Detection
          </h4>
          <div className="space-y-2 text-sm text-gray-700 ml-7">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>High Resolution:</strong> Upload images at least 512x512 pixels for best results</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Clear Faces:</strong> Ensure faces are clearly visible and well-lit</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Original Files:</strong> Use uncompressed or minimally compressed images when possible</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Front-Facing:</strong> Images with faces looking directly at camera work best</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Single Subject:</strong> Focus on images with one primary face for clearest results</span>
            </div>
          </div>
        </div>

        {/* What to Avoid */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            What to Avoid
          </h4>
          <div className="space-y-2 text-sm text-gray-700 ml-7">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>Heavy Compression:</strong> Avoid highly compressed JPEG files (quality below 70%)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>Extreme Angles:</strong> Profile shots or extreme angles may reduce accuracy</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>Filters/Effects:</strong> Images with heavy filters or artistic effects</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>Obstructions:</strong> Faces partially covered by hands, sunglasses, or masks</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">•</span>
              <span><strong>Very Low Light:</strong> Underexposed or very dark images</span>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Supported Formats</div>
              <div className="text-blue-800">
                JPEG, JPG, PNG, GIF, BMP, WebP • Maximum 10MB per file
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-indigo-900 mb-2">Pro Tips</div>
              <div className="text-indigo-800 space-y-1">
                <div>• Use batch mode to analyze multiple images efficiently</div>
                <div>• Compare results across different photos of the same person</div>
                <div>• Check the heatmap to understand what the AI is detecting</div>
                <div>• Higher confidence scores indicate stronger evidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Your privacy is protected: Images are processed locally and not stored on our servers</span>
        </div>
      </div>
    </div>
  );
}
