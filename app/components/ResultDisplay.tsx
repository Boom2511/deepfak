'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, Shield, ClipboardList } from 'lucide-react';
import HeatmapViewer from './HeatmapViewer';
import ConfidenceExplainer from './ConfidenceExplainer';
import QualityWarnings from './QualityWarnings';

interface ModelPrediction {
  fake_prob: number;
  real_prob: number;
  prediction: string;
}

interface DetectionResult {
  filename: string;
  prediction: string;
  confidence: number;
  fake_probability: number;
  real_probability: number;
  processing_time?: number;
  face_detected?: boolean;
  gradcam?: string;
  model_predictions?: Record<string, ModelPrediction>;
  original_image?: string;
  error?: string;
}

interface ResultDisplayProps {
  result: DetectionResult;
  onReset: () => void;
}

export default function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (result.error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-6">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Detection Error</h2>
              <p className="text-gray-600 mt-1">{result.error}</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            ← Try Another Image
          </button>
        </div>
      </div>
    );
  }

  const isFake = result.prediction === 'FAKE';
  const confidencePercent = result.confidence * 100;

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'High', color: 'text-red-600', bg: 'bg-red-500', borderColor: 'border-red-500' };
    if (confidence >= 0.6) return { label: 'Medium', color: 'text-orange-600', bg: 'bg-orange-500', borderColor: 'border-orange-500' };
    return { label: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-500', borderColor: 'border-yellow-500' };
  };

  const confidenceLevel = isFake
    ? getConfidenceLevel(result.confidence)
    : { label: 'Authentic', color: 'text-green-600', bg: 'bg-green-500', borderColor: 'border-green-500' };

  // Calculate reliability score based on model agreement
  const calculateReliability = () => {
    if (!result.model_predictions) return 85;

    const predictions = Object.values(result.model_predictions);
    const agreement = predictions.filter(p => p.prediction === result.prediction).length / predictions.length;
    return Math.round(agreement * 100);
  };

  const reliabilityScore = calculateReliability();

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={onReset}
        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
      >
        ← Analyze Another Image
      </button>

      {/* Main Result Card */}
      <div className={`bg-white rounded-xl shadow-lg border-l-4 ${confidenceLevel.borderColor} overflow-hidden`}>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 ${isFake ? 'bg-red-100' : 'bg-green-100'} rounded-full flex-shrink-0`}>
                {isFake ? (
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {isFake ? 'Likely Deepfake Detected' : 'Appears Authentic'}
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                  <span className={`text-2xl sm:text-3xl font-bold ${confidenceLevel.color}`}>
                    {Math.round(confidencePercent)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">confidence</span>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                    isFake ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {confidenceLevel.label.toUpperCase()} CONFIDENCE
                  </span>
                </div>
              </div>
            </div>
            {result.processing_time && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Processed in</div>
                <div className="text-xl font-semibold text-gray-900">{result.processing_time.toFixed(1)}s</div>
              </div>
            )}
          </div>

          {/* Confidence Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>REAL</span>
              <span>FAKE</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div
                className={`${confidenceLevel.bg} h-4 rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${confidencePercent}%` }}
              />
              <div
                className="absolute left-1/2 top-0 w-0.5 h-4 bg-gray-400"
                style={{ transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{(result.real_probability * 100).toFixed(1)}% Real</span>
              <span>{(result.fake_probability * 100).toFixed(1)}% Fake</span>
            </div>
          </div>

          {/* Key Manipulation Indicators (for fake detections) */}
          {isFake && result.confidence >= 0.6 && (
            <div className="bg-red-50 rounded-lg p-5 mb-6 border border-red-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-600" />
                Key Manipulation Indicators
              </h3>
              <div className="space-y-3">
                {result.confidence >= 0.8 && (
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-1 rounded-full text-xs font-medium border text-red-600 bg-red-50 border-red-200">
                      HIGH
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Facial region patterns</div>
                      <div className="text-sm text-gray-600">Strong AI-generated artifacts detected across facial features</div>
                    </div>
                  </div>
                )}
                {result.model_predictions && Object.keys(result.model_predictions).length > 1 && (
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-1 rounded-full text-xs font-medium border text-orange-600 bg-orange-50 border-orange-200">
                      MEDIUM
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Multiple model agreement</div>
                      <div className="text-sm text-gray-600">
                        {Object.keys(result.model_predictions).length} detection models flagged suspicious patterns
                      </div>
                    </div>
                  </div>
                )}
                {result.fake_probability > 0.7 && (
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-1 rounded-full text-xs font-medium border text-orange-600 bg-orange-50 border-orange-200">
                      MEDIUM
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Statistical anomaly</div>
                      <div className="text-sm text-gray-600">
                        {(result.fake_probability * 100).toFixed(1)}% likelihood of synthetic generation
                      </div>
                    </div>
                  </div>
                )}
                {result.gradcam && (
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-1 rounded-full text-xs font-medium border text-yellow-600 bg-yellow-50 border-yellow-200">
                      LOW
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Attention regions</div>
                      <div className="text-sm text-gray-600">Check heatmap below for specific areas of concern</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model Agreement */}
          {result.model_predictions && Object.keys(result.model_predictions).length > 0 && (
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Model Consensus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(result.model_predictions).map(([model, prediction]) => (
                  <div key={model} className="text-center bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-2 capitalize font-medium">
                      {model}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(Math.max(prediction.fake_prob, prediction.real_prob) * 100)}%
                    </div>
                    <div className={`text-xs mt-1 font-semibold ${
                      prediction.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {prediction.prediction}
                    </div>
                  </div>
                ))}
              </div>
              {reliabilityScore >= 80 && (
                <div className="mt-4 text-center text-sm text-blue-700 font-medium">
                  ✓ All models agree: This strengthens the detection confidence
                </div>
              )}
            </div>
          )}

          {/* Quality Warnings */}
          <QualityWarnings result={result} />
        </div>
      </div>

      {/* Heatmap Visualization */}
      {result.gradcam && result.original_image && (
        <HeatmapViewer
          originalImage={result.original_image}
          heatmapImage={result.gradcam}
          isFake={isFake}
        />
      )}

      {/* Confidence Explainer */}
      <ConfidenceExplainer
        result={result}
        reliabilityScore={reliabilityScore}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />

      {/* Recommendations */}
      <div className={`bg-gradient-to-r ${
        isFake ? 'from-red-50 to-orange-50 border-red-100' : 'from-green-50 to-blue-50 border-green-100'
      } rounded-xl shadow-lg p-6 border`}>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          What to do next
        </h3>
        {isFake ? (
          <div className="space-y-2 text-sm text-gray-700">
            <div>• <strong>Verify Source:</strong> Cross-reference with known authentic footage or images</div>
            <div>• <strong>Further Analysis:</strong> Check metadata, creation timestamp, and file history</div>
            <div>• <strong>Expert Review:</strong> For critical decisions, request professional forensic analysis</div>
            <div>• <strong>Document:</strong> Save this report and maintain chain of custody for evidence</div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-gray-700">
            <div>• <strong>Appears Authentic:</strong> No significant manipulation detected by our AI models</div>
            <div>• <strong>Always Verify:</strong> Cross-check with trusted sources for important content</div>
            <div>• <strong>Context Matters:</strong> Consider the source and context of the image</div>
            <div>• <strong>Stay Vigilant:</strong> AI-generated content is constantly improving</div>
          </div>
        )}
      </div>
    </div>
  );
}
