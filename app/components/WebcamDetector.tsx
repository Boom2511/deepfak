'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Square, Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface WebcamResult {
  prediction: string;
  confidence: number;
  fake_probability: number;
  real_probability: number;
  timestamp: number;
}

export default function WebcamDetector() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<WebcamResult | null>(null);
  const [recentResults, setRecentResults] = useState<WebcamResult[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  const startStreaming = async () => {
    try {
      setError(null);

      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsStreaming(true);

      // Connect to WebSocket
      connectWebSocket();

      // Start capturing frames
      intervalRef.current = setInterval(() => {
        captureAndSendFrame();
      }, 2000); // Send frame every 2 seconds

    } catch (err: unknown) { // Changed 'any' to 'unknown' for type safety
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to access webcam: ${message}`);
    }
  };

  const stopStreaming = () => {
    // Stop webcam
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsStreaming(false);
    setIsProcessing(false);
  };

  const connectWebSocket = () => {
    const ws = new WebSocket('https://boom2511-deepfake-detection.hf.space');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const result = JSON.parse(event.data);

      if (result.error) {
        console.error('Detection error:', result.error);
        setIsProcessing(false);
        return;
      }

      setLatestResult(result);
      setRecentResults(prev => [result, ...prev].slice(0, 10));
      setIsProcessing(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection failed');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;
    if (isProcessing) return; // Skip if still processing previous frame

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    // Send to server
    setIsProcessing(true);
    wsRef.current.send(dataUrl);
  };

  const getResultColor = (prediction: string) => {
    return prediction === 'FAKE' ? 'text-red-600' : 'text-green-600';
  };

  const getResultIcon = (prediction: string) => {
    return prediction === 'FAKE'
      ? <XCircle className="w-6 h-6 text-red-600" />
      : <CheckCircle className="w-6 h-6 text-green-600" />;
  };

  // Calculate statistics
  const stats = recentResults.length > 0 ? {
    avgConfidence: (recentResults.reduce((sum, r) => sum + r.confidence, 0) / recentResults.length * 100).toFixed(1),
    fakeCount: recentResults.filter(r => r.prediction === 'FAKE').length,
    realCount: recentResults.filter(r => r.prediction === 'REAL').length,
    fakeRatio: (recentResults.filter(r => r.prediction === 'FAKE').length / recentResults.length * 100).toFixed(1)
  } : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-600" />
              Real-time Webcam Detection
            </h2>
            <p className="text-gray-600 mt-1">
              Live deepfake detection using your webcam
            </p>
          </div>

          {!isStreaming ? (
            <button
              onClick={startStreaming}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start Webcam
            </button>
          ) : (
            <button
              onClick={stopStreaming}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              Stop Webcam
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}
      </div>

      {/* Video Feed and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Feed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Video Feed</h3>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-gray-400">
                  <Camera className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>Click &quot;Start Webcam&quot; to begin</p>
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Current Result */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detection Result</h3>

          {latestResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getResultIcon(latestResult.prediction)}
                  <div>
                    <div className={`text-2xl font-bold ${getResultColor(latestResult.prediction)}`}>
                      {latestResult.prediction}
                    </div>
                    <div className="text-sm text-gray-600">Prediction</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {(latestResult.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 mb-1">Fake Probability</div>
                  <div className="text-xl font-bold text-red-700">
                    {(latestResult.fake_probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Real Probability</div>
                  <div className="text-xl font-bold text-green-700">
                    {(latestResult.real_probability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {stats && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Session Statistics</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Frames Analyzed:</span>
                      <span className="ml-2 font-semibold">{recentResults.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Confidence:</span>
                      <span className="ml-2 font-semibold">{stats.avgConfidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fake Detected:</span>
                      <span className="ml-2 font-semibold text-red-600">{stats.fakeCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Real Detected:</span>
                      <span className="ml-2 font-semibold text-green-600">{stats.realCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No detection result yet</p>
              <p className="text-sm mt-1">Results will appear here once streaming starts</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl shadow p-6 border border-blue-100">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Frames are captured every 2 seconds for real-time analysis</li>
              <li>• Results show live predictions with confidence scores</li>
              <li>• Session statistics track performance over multiple frames</li>
              <li>• All processing happens on the server - your images are not stored</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
