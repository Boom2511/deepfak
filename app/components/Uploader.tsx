'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Brain, Upload, FileImage, Target, Zap, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ModelPrediction {
  fake_prob: number;
  real_prob: number;
  prediction: string;
  confidence: number;
}

interface DetectionResult {
  filename: string;
  prediction: string;
  confidence: number;
  fake_probability: number;
  real_probability: number;
  processing_time: number;
  face_detection_confidence?: number;
  total_faces_detected?: number;
  gradcam?: string;
  explanation?: string;
  model_name?: string;
  device?: string;
  error?: string;
  model_predictions?: Record<string, ModelPrediction>;
  models_used?: string[];
  total_models?: number;
  original_image?: string;
}

interface UploaderProps {
  onResult: (result: DetectionResult | null) => void;
}

const API_BASE_URL = 'https://boom2511-deepfake-detection.hf.space';

export default function ProductionUploader({ onResult }: UploaderProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const detectImage = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    onResult(null);

    console.log('[UPLOAD] Starting detection for:', file.name);
    console.log('[UPLOAD] File size:', (file.size / 1024).toFixed(2), 'KB');
    console.log('[UPLOAD] File type:', file.type);

    try {
      // Create base64 URL for original image
      const reader = new FileReader();
      const originalImagePromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Create FormData with only the file
      const formData = new FormData();
      formData.append('file', file);

      console.log('[UPLOAD] FormData prepared with file:', file.name);

      // Build URL with query parameter
      const url = new URL(`${API_BASE_URL}/api/detect/image`);
      url.searchParams.append('generate_heatmap', 'true');

      console.log('[UPLOAD] Request URL:', url.toString());

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      console.log('[UPLOAD] Sending request...');

      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - browser will set it with boundary
      });

      clearInterval(progressInterval);
      setProgress(100);

      console.log('[UPLOAD] Response status:', response.status);
      console.log('[UPLOAD] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UPLOAD] Error response:', errorText);
        
        let errorMessage = 'Detection failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[UPLOAD] Success! Result:', result);

      const originalImage = await originalImagePromise;

      // Add original image to result
      result.original_image = originalImage;
      onResult(result);

    } catch (error) {
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        // Parse specific errors
        if (error.message.includes('No face detected')) {
          errorMessage = t('error.no_face');
        } else if (error.message.includes('File too large')) {
          errorMessage = t('error.file_large');
        } else if (error.message.includes('Invalid file type')) {
          errorMessage = t('error.invalid_type');
        } else if (error.message.includes('Network')) {
          errorMessage = t('error.network');
        } else if (error.message.includes('confidence too low')) {
          errorMessage = t('error.confidence_low');
        } else {
          errorMessage = error.message;
        }
      }

      console.error('[UPLOAD] Error:', errorMessage);
      console.error('[UPLOAD] Full error:', error);

      setError(errorMessage);
      onResult({
        filename: file.name,
        prediction: 'Error',
        confidence: 0,
        fake_probability: 0,
        real_probability: 0,
        processing_time: 0,
        error: errorMessage
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [onResult, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) {
        console.log('[DROPZONE] File dropped:', files[0].name);
        detectImage(files[0]);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: loading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${loading 
            ? 'cursor-not-allowed opacity-75' 
            : 'cursor-pointer hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="space-y-4">
            <Brain className="w-16 h-16 text-blue-600 mx-auto animate-pulse" />
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {t('upload.analyzing')}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {progress}% {t('upload.progress')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isDragActive ? (
              <Upload className="w-16 h-16 text-indigo-500 mx-auto" />
            ) : (
              <FileImage className="w-16 h-16 text-gray-400 mx-auto" />
            )}
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive
                  ? t('upload.drag')
                  : t('upload.title')
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {t('upload.support')}
              </p>
              <button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                {t('upload.select')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Please check browser console (F12) for more details
          </p>
        </div>
      )}

      {/* Features highlight */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800">{t('feature.accuracy')}</p>
          <p className="text-xs text-green-600">{t('feature.accuracy.desc')}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-blue-800">{t('feature.fast')}</p>
          <p className="text-xs text-blue-600">{t('feature.fast.desc')}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <Shield className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-purple-800">{t('feature.explain')}</p>
          <p className="text-xs text-purple-600">{t('feature.explain.desc')}</p>
        </div>
      </div>
    </div>
  );
}
