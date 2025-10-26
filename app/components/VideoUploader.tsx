'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Video, Loader, CheckCircle, Film, BarChart3, AlertCircle } from 'lucide-react';

interface VideoResult {
  video_info: {
    filename: string;
    total_frames: number;
    fps: number;
    duration_seconds: number;
    resolution: string;
  };
  processing_info: {
    frames_processed: number;
    frame_skip: number;
    processing_time: number;
    processing_fps: number;
  };
  overall_result: {
    prediction: string;
    confidence: number;
    fake_frame_ratio: number;
    total_fake_frames: number;
    total_real_frames: number;
  };
  key_frame_heatmaps?: Array<{
    frame_number: number;
    timestamp: number;
    fake_probability: number;
    gradcam?: string;
  }>;
  summary: {
    avg_confidence: number;
    max_fake_confidence: number;
    min_fake_confidence: number;
  };
}

const API_BASE_URL = 'https://boom2511-deepfake-detection.hf.space';

export default function VideoUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[VIDEO] Starting upload for:', file.name);
    console.log('[VIDEO] File size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('[VIDEO] File type:', file.type);

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file (MP4, AVI, MOV, etc.)');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file is too large (max 100MB)');
      return;
    }

    setError(null);
    setResult(null);
    setIsUploading(true);
    setProgress(0);

    try {
      // Create FormData with only the file
      const formData = new FormData();
      formData.append('file', file);

      // Build URL with query parameters
      const url = new URL(`${API_BASE_URL}/api/video/detect`);
      url.searchParams.append('frame_skip', '5');
      url.searchParams.append('max_frames', '100');

      console.log('[VIDEO] Request URL:', url.toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 90));
      }, 1000);

      console.log('[VIDEO] Sending request...');

      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      console.log('[VIDEO] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VIDEO] Error response:', errorText);
        
        let errorMessage = 'Video processing failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[VIDEO] Success! Result:', data);
      setResult(data);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during video processing';
      console.error('[VIDEO] Error:', message);
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploader = () => {
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const getResultColor = (prediction: string) => {
    return prediction === 'FAKE' ? 'text-red-600' : 'text-green-600';
  };

  const getResultBgColor = (prediction: string) => {
    return prediction === 'FAKE' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  };

  if (result) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Video Analysis Complete</h2>
                <p className="text-gray-600">{result.video_info.filename}</p>
              </div>
            </div>
            <button
              onClick={resetUploader}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Analyze Another Video
            </button>
          </div>
        </div>

        {/* Overall Result */}
        <div className={`rounded-xl shadow-lg p-8 border-2 ${getResultBgColor(result.overall_result.prediction)}`}>
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold ${getResultColor(result.overall_result.prediction)} mb-2`}>
              {result.overall_result.prediction}
            </div>
            <div className="text-xl text-gray-700">
              {(result.overall_result.confidence * 100).toFixed(1)}% Confidence
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Fake Frames</div>
              <div className="text-2xl font-bold text-red-600">{result.overall_result.total_fake_frames}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Real Frames</div>
              <div className="text-2xl font-bold text-green-600">{result.overall_result.total_real_frames}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Fake Ratio</div>
              <div className="text-2xl font-bold text-gray-900">
                {(result.overall_result.fake_frame_ratio * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Avg Confidence</div>
              <div className="text-2xl font-bold text-gray-900">
                {(result.summary.avg_confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Video Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-600" />
              Video Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">{result.video_info.duration_seconds.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Frames:</span>
                <span className="font-semibold">{result.video_info.total_frames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">FPS:</span>
                <span className="font-semibold">{result.video_info.fps.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resolution:</span>
                <span className="font-semibold">{result.video_info.resolution}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Processing Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Frames Analyzed:</span>
                <span className="font-semibold">{result.processing_info.frames_processed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frame Skip:</span>
                <span className="font-semibold">Every {result.processing_info.frame_skip} frames</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-semibold">{result.processing_info.processing_time.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing FPS:</span>
                <span className="font-semibold">{result.processing_info.processing_fps.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Frame Heatmaps */}
        {result.key_frame_heatmaps && result.key_frame_heatmaps.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Most Suspicious Frames (Grad-CAM Visualization)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.key_frame_heatmaps.map((frame, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <div className="text-sm text-gray-600">
                      Frame #{frame.frame_number} • {frame.timestamp.toFixed(2)}s
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {(frame.fake_probability * 100).toFixed(1)}% Fake Probability
                    </div>
                  </div>
                  {frame.gradcam && (
                    <Image
                      src={frame.gradcam}
                      alt={`Frame ${frame.frame_number} heatmap`}
                      width={300}
                      height={300}
                      className="w-full rounded-lg shadow"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Video className="w-8 h-8 text-purple-600" />
          Video Deepfake Detection
        </h2>

        {isUploading ? (
          <div className="space-y-4">
            <div className="text-center py-12">
              <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <div className="text-lg font-semibold text-gray-900 mb-2">Processing Video...</div>
              <div className="text-gray-600 mb-4">Analyzing frames for deepfake detection</div>

              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-2">{progress}%</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  Upload a video file
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Supports MP4, AVI, MOV • Max 100MB
                </div>
                <div className="mt-4">
                  <span className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block">
                    Select Video
                  </span>
                </div>
              </label>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-red-800 font-medium">{error}</div>
                  <div className="text-red-600 text-sm mt-1">Check browser console (F12) for details</div>
                </div>
              </div>
            )}

            <div className="mt-6 bg-purple-50 rounded-lg p-6 border border-purple-100">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Processing Details</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Analyzes every 5th frame for efficiency</li>
                    <li>• Maximum 100 frames processed per video</li>
                    <li>• Generates Grad-CAM heatmaps for top 3 suspicious frames</li>
                    <li>• Provides detailed frame-by-frame statistics</li>
                    <li>• Overall verdict based on fake frame ratio</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
