'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Brain, Upload, FileImage, Target, Zap, Shield } from 'lucide-react';

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

export default function ProductionUploader({ onResult }: UploaderProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const detectImage = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(0);
    onResult(null);

    try {
      // Create base64 URL for original image
      const reader = new FileReader();
      const originalImagePromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('include_gradcam', 'true');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:8000/api/detect/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Detection failed');
      }

      const result = await response.json();
      const originalImage = await originalImagePromise;

      // Add original image to result
      result.original_image = originalImage;
      onResult(result);

    } catch (error) {
      onResult({
        filename: file.name,
        prediction: 'Error',
        confidence: 0,
        fake_probability: 0,
        real_probability: 0,
        processing_time: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [onResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) {
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
                Analyzing image with AI...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {progress}% complete
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
                  ? 'Drop your image here...'
                  : 'Upload image for deepfake detection'
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports: JPEG, PNG, GIF, WebP • Max 10MB
              </p>
              <button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                Select Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features highlight */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800">High Accuracy</p>
          <p className="text-xs text-green-600">94%+ detection rate</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-blue-800">Fast Processing</p>
          <p className="text-xs text-blue-600">Results in 2-3 seconds</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <Shield className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-purple-800">AI Explanation</p>
          <p className="text-xs text-purple-600">Visual analysis included</p>
        </div>
      </div>
    </div>
  );
}