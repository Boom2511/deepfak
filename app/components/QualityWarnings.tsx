'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

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
  face_detected?: boolean;
  model_predictions?: Record<string, ModelPrediction>;
}

interface QualityWarningsProps {
  result: DetectionResult;
}

export default function QualityWarnings({ result }: QualityWarningsProps) {
  const warnings = [];
  const infos = [];

  // Check for low confidence
  if (result.confidence < 0.6) {
    warnings.push({
      severity: 'medium' as const,
      message: 'Low confidence detection - results may be less reliable',
      detail: 'Consider testing with a higher quality image or different angle'
    });
  }

  // Check for borderline predictions (close to 50/50)
  const realProb = result.real_probability * 100;
  const fakeProb = result.fake_probability * 100;
  const difference = Math.abs(realProb - fakeProb);

  if (difference < 20) {
    warnings.push({
      severity: 'medium' as const,
      message: 'Borderline prediction - models are uncertain',
      detail: `Real: ${realProb.toFixed(1)}% vs Fake: ${fakeProb.toFixed(1)}% - Very close call`
    });
  }

  // Check for model disagreement
  if (result.model_predictions) {
    const predictions = Object.values(result.model_predictions);
    const fakeCount = predictions.filter(p => p.prediction === 'FAKE').length;
    const realCount = predictions.filter(p => p.prediction === 'REAL').length;

    if (fakeCount > 0 && realCount > 0) {
      warnings.push({
        severity: 'low' as const,
        message: 'Mixed model predictions',
        detail: `${fakeCount} model(s) predict FAKE, ${realCount} predict REAL`
      });
    }
  }

  // Check for no face detected
  if (result.face_detected === false) {
    warnings.push({
      severity: 'high' as const,
      message: 'No face detected in image',
      detail: 'Detection may be less accurate without clear facial features'
    });
  }

  // Add informational messages based on good indicators
  if (result.confidence >= 0.8) {
    infos.push({
      message: 'High confidence detection',
      detail: 'Strong signals detected by AI models'
    });
  }

  if (result.model_predictions) {
    const predictions = Object.values(result.model_predictions);
    const agreement = predictions.filter(p => p.prediction === result.prediction).length / predictions.length;

    if (agreement === 1) {
      infos.push({
        message: 'Perfect model agreement',
        detail: 'All models reached the same conclusion'
      });
    }
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'low':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    const className = severity === 'high' ? 'text-red-600' :
      severity === 'medium' ? 'text-orange-600' : 'text-yellow-600';
    return <AlertTriangle className={`w-5 h-5 ${className}`} />;
  };

  // Don't render if no warnings or infos
  if (warnings.length === 0 && infos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Warnings */}
      {warnings.map((warning, idx) => (
        <div
          key={`warning-${idx}`}
          className={`rounded-lg p-4 border ${getSeverityColor(warning.severity)}`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(warning.severity)}
            <div className="flex-1">
              <div className="font-medium mb-1">{warning.message}</div>
              <div className="text-sm opacity-90">{warning.detail}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Informational messages */}
      {infos.map((info, idx) => (
        <div
          key={`info-${idx}`}
          className="rounded-lg p-4 border bg-blue-50 border-blue-200 text-blue-800"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium mb-1">{info.message}</div>
              <div className="text-sm opacity-90">{info.detail}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
