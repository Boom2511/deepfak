'use client';

import React from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

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
  model_predictions?: Record<string, ModelPrediction>;
}

interface ConfidenceExplainerProps {
  result: DetectionResult;
  reliabilityScore: number;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
}

export default function ConfidenceExplainer({
  result,
  reliabilityScore,
  showDetails,
  setShowDetails
}: ConfidenceExplainerProps) {
  const getQualityFactors = () => {
    const factors = [];

    // Face detection
    if (result.face_detected !== false) {
      factors.push({
        factor: 'Clear facial features detected',
        impact: 'positive' as const,
        icon: '✓'
      });
    } else {
      factors.push({
        factor: 'No face detected',
        impact: 'negative' as const,
        icon: '⚠'
      });
    }

    // Model agreement
    if (result.model_predictions) {
      const predictions = Object.values(result.model_predictions);
      const agreement = predictions.filter(p => p.prediction === result.prediction).length / predictions.length;

      if (agreement === 1) {
        factors.push({
          factor: 'All models agree on prediction',
          impact: 'positive' as const,
          icon: '✓'
        });
      } else if (agreement >= 0.66) {
        factors.push({
          factor: 'Majority of models agree',
          impact: 'positive' as const,
          icon: '✓'
        });
      } else {
        factors.push({
          factor: 'Models show mixed predictions',
          impact: 'negative' as const,
          icon: '⚠'
        });
      }
    }

    // Confidence level
    if (result.confidence >= 0.8) {
      factors.push({
        factor: 'High confidence prediction',
        impact: 'positive' as const,
        icon: '✓'
      });
    } else if (result.confidence >= 0.6) {
      factors.push({
        factor: 'Medium confidence prediction',
        impact: 'minor' as const,
        icon: '⚠'
      });
    } else {
      factors.push({
        factor: 'Low confidence - borderline case',
        impact: 'negative' as const,
        icon: '⚠'
      });
    }

    // Processing time (faster usually means clearer signals)
    if (result.processing_time && result.processing_time < 3) {
      factors.push({
        factor: 'Fast processing indicates clear signals',
        impact: 'positive' as const,
        icon: '✓'
      });
    }

    return factors;
  };

  const qualityFactors = getQualityFactors();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600" />
          Detection Quality & Reliability Score
        </h3>
        {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showDetails && (
        <div className="px-6 pb-6 border-t">
          <div className="grid grid-cols-2 gap-6 mb-6 pt-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">Detection Confidence</div>
              <div className={`text-3xl font-bold ${
                result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'
              }`}>
                {Math.round(result.confidence * 100)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {result.prediction === 'FAKE' ? 'Likelihood of being fake' : 'Likelihood of being real'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Reliability Score</div>
              <div className={`text-3xl font-bold ${
                reliabilityScore >= 80 ? 'text-green-600' : reliabilityScore >= 60 ? 'text-yellow-600' : 'text-orange-600'
              }`}>
                {reliabilityScore}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on model agreement
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-medium text-gray-900 mb-3">Why we&apos;re confident in this detection:</div>
            {qualityFactors.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <span className={`text-lg ${
                  factor.impact === 'positive' ? 'text-green-600' :
                    factor.impact === 'minor' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {factor.icon}
                </span>
                <span className="text-gray-700">{factor.factor}</span>
              </div>
            ))}
          </div>

          {/* Additional metrics */}
          {result.model_predictions && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm font-medium text-gray-900 mb-3">Model Performance Breakdown</div>
              <div className="space-y-2">
                {Object.entries(result.model_predictions).map(([model, pred]) => {
                  const maxProb = Math.max(pred.fake_prob, pred.real_prob);
                  const maxProbPercent = maxProb * 100; // ✅ แปลงเป็น 0-100
                  return (
                    <div key={model} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize">{model}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              pred.prediction === 'FAKE' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${maxProbPercent}%` }}
                          />
                        </div>
                        <span className="text-gray-600 w-12 text-right">{maxProbPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
