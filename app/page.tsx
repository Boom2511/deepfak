'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle, XCircle, Clock, Download, FileText, AlertCircle, Search, Zap, Brain, Shield, Lock, Database, Cpu, GraduationCap, Image as ImageIcon, BarChart3, Video, Camera } from 'lucide-react';
import ProductionUploader from './components/Uploader';
import ResultDisplay from './components/ResultDisplay';
import UploadAssistant from './components/UploadAssistant';
import VideoUploader from './components/VideoUploader';
import WebcamDetector from './components/WebcamDetector';

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

interface FileItem {
  id: string;
  file: File;
  name: string;
  size: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result: BatchDetectionResult | null;
  originalImage?: string;
}

interface BatchDetectionResult {
  id: string;
  name: string;
  prediction: string;
  confidence: number;
  fake_probability: number;
  real_probability: number;
  processingTime: string;
  status: string;
  gradcam?: string;
  model_predictions?: Record<string, ModelPrediction>;
}

type AnalysisMode = 'single' | 'batch' | 'video' | 'webcam';

export default function Home() {
  const [mode, setMode] = useState<AnalysisMode>('single');
  const [result, setResult] = useState<DetectionResult | null>(null);

  // Batch mode states
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchDetectionResult[]>([]);

  const handleReset = () => {
    setResult(null);
  };

  const handleModeChange = (newMode: AnalysisMode) => {
    setMode(newMode);
    setResult(null);
    setFiles([]);
    setBatchResults([]);
  };

  // Batch mode handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).slice(0, 10 - files.length).map((file, idx) => ({
      id: `file_${Date.now()}_${idx}`,
      file: file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      status: 'pending' as const,
      progress: 0,
      result: null
    }));
    setFiles(prev => [...prev, ...newFiles].slice(0, 10));
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    setBatchResults(batchResults.filter(r => r.id !== id));
  };

  const processBatch = async () => {
    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];

      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'processing' as const, progress: 0 } : f
      ));

      try {
        const reader = new FileReader();
        const originalImagePromise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(fileItem.file);
        });

        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('include_gradcam', 'true');

        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ));
        }, 200);

        const startTime = Date.now();
        const response = await fetch('https://boom2511-deepfake-detection.hf.space', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Detection failed');
        }

        const data = await response.json();
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const originalImage = await originalImagePromise;

        const result: BatchDetectionResult = {
          id: fileItem.id,
          name: fileItem.name,
          prediction: data.prediction,
          confidence: data.confidence,
          fake_probability: data.fake_probability,
          real_probability: data.real_probability,
          processingTime: processingTime,
          status: 'completed',
          gradcam: data.gradcam,
          model_predictions: data.model_predictions
        };

        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? {
            ...f,
            status: 'completed' as const,
            progress: 100,
            result,
            originalImage
          } : f
        ));

        setBatchResults(prev => [...prev, result]);

      } catch {
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, status: 'failed' as const, progress: 0 } : f
        ));
      }
    }

    setProcessing(false);
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const data = JSON.stringify(batchResults, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_results_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = 'Filename,Prediction,Confidence,Fake Probability,Real Probability,Processing Time\n';
      const rows = batchResults.map(r =>
        `${r.name},${r.prediction},${(r.confidence * 100).toFixed(1)}%,${(r.fake_probability * 100).toFixed(1)}%,${(r.real_probability * 100).toFixed(1)}%,${r.processingTime}s`
      ).join('\n');
      const csv = headers + rows;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_results_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResultColor = (prediction: string) => {
    return prediction === 'FAKE' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  };

  const stats = {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    processing: files.filter(f => f.status === 'processing').length,
    pending: files.filter(f => f.status === 'pending').length,
    fake: batchResults.filter(r => r.prediction === 'FAKE').length,
    real: batchResults.filter(r => r.prediction === 'REAL').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="text-center py-6 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Search className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600 flex-shrink-0" />
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
              DeepFake Detector Pro
            </h1>
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Advanced AI-powered deepfake detection using state-of-the-art deep learning models.
            Upload any image to detect AI-generated or manipulated content with high accuracy.
          </p>
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm px-2">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium">94%+ Accuracy</span>
            </span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center gap-1.5 sm:gap-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Real-time</span>
            </span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 flex items-center gap-1.5 sm:gap-2">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium">AI Explain</span>
            </span>
          </div>

          {/* Mode Tabs - Mobile Optimized */}
          <div className="mt-6 sm:mt-8 w-full sm:inline-flex justify-center">
            <div className="bg-white rounded-lg shadow-lg p-1.5 border border-gray-200 grid grid-cols-2 sm:flex sm:flex-wrap gap-1 max-w-2xl mx-auto">
              <button
                onClick={() => handleModeChange('single')}
                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  mode === 'single'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Image</span>
              </button>
              <button
                onClick={() => handleModeChange('batch')}
                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  mode === 'batch'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Batch</span>
              </button>
              <button
                onClick={() => handleModeChange('video')}
                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  mode === 'video'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Video</span>
              </button>
              <button
                onClick={() => handleModeChange('webcam')}
                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  mode === 'webcam'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Webcam</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        {mode === 'single' ? (
          // Single Image Mode
          !result ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <ProductionUploader onResult={setResult} />
              <UploadAssistant />
            </div>
          ) : (
            <ResultDisplay result={result} onReset={handleReset} />
          )
        ) : mode === 'video' ? (
          // Video Mode
          <VideoUploader />
        ) : mode === 'webcam' ? (
          // Webcam Mode
          <WebcamDetector />
        ) : (
          // Batch Mode
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={files.length >= 10 || processing}
                />
                <label htmlFor="file-upload" className={`cursor-pointer ${(files.length >= 10 || processing) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    Drop images here or click to upload
                  </div>
                  <div className="text-sm text-gray-500">
                    Supports JPG, PNG • Max 10 files • 10MB per file
                  </div>
                  <div className="mt-4">
                    <span className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block">
                      Select Files
                    </span>
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  {files.length} / 10 files uploaded
                  {files.length >= 10 && <span className="text-orange-600 ml-2">(Maximum reached)</span>}
                </div>
              )}
            </div>

            {/* Stats Dashboard */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Files</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-4">
                  <div className="text-sm text-green-600 mb-1">Completed</div>
                  <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
                </div>
                <div className="bg-blue-50 rounded-lg shadow p-4">
                  <div className="text-sm text-blue-600 mb-1">Processing</div>
                  <div className="text-2xl font-bold text-blue-700">{stats.processing}</div>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-4">
                  <div className="text-sm text-red-600 mb-1">Fake Detected</div>
                  <div className="text-2xl font-bold text-red-700">{stats.fake}</div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-4">
                  <div className="text-sm text-green-600 mb-1">Real</div>
                  <div className="text-2xl font-bold text-green-700">{stats.real}</div>
                </div>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Files Queue</h2>
                    <div className="flex gap-3">
                      {!processing && files.length > 0 && stats.completed === 0 && (
                        <button
                          onClick={processBatch}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Start Analysis
                        </button>
                      )}
                      {batchResults.length > 0 && (
                        <>
                          <button
                            onClick={() => exportResults('csv')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export CSV
                          </button>
                          <button
                            onClick={() => exportResults('json')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Export JSON
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="divide-y">
                  {files.map((file) => (
                    <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 flex-1">
                          {getStatusIcon(file.status)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{file.name}</div>
                            <div className="text-sm text-gray-500">{file.size}</div>
                          </div>
                        </div>

                        {file.result && (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-lg font-bold px-3 py-1 rounded ${getResultColor(file.result.prediction)}`}>
                                {file.result.prediction}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {(file.result.confidence * 100).toFixed(1)}% confidence
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Processing Time</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {file.result.processingTime}s
                              </div>
                            </div>
                          </div>
                        )}

                        {!processing && file.status === 'pending' && (
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        )}
                      </div>

                      {file.status === 'processing' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Processing... {file.progress}%
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {files.length === 0 && (
              <div className="bg-blue-50 rounded-xl shadow p-6 border border-blue-100">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Tips for Best Results</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Upload high-resolution images (minimum 512x512px)</li>
                      <li>• Use original, uncompressed files when possible</li>
                      <li>• Ensure faces are clearly visible and well-lit</li>
                      <li>• Batch processing is faster than individual uploads</li>
                      <li>• Results can be exported in CSV or JSON format</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Report */}
            {batchResults.length > 0 && stats.completed === files.length && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Analysis Complete!</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-sm opacity-90 mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Total Analyzed
                    </div>
                    <div className="text-4xl font-bold">{batchResults.length}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-sm opacity-90 mb-1 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Average Confidence
                    </div>
                    <div className="text-4xl font-bold">
                      {(batchResults.reduce((sum, r) => sum + r.confidence, 0) / batchResults.length * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-sm opacity-90 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Total Processing Time
                    </div>
                    <div className="text-4xl font-bold">
                      {batchResults.reduce((sum, r) => sum + parseFloat(r.processingTime), 0).toFixed(1)}s
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-600 mb-4 font-medium">
            Powered by Xception, Effort-CLIP, MTCNN Face Detection, and Grad-CAM Visualization
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Protected</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <Database className="w-3.5 h-3.5" />
              <span>No Data Stored</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <Cpu className="w-3.5 h-3.5" />
              <span>CPU Accelerated</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Research Grade</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
