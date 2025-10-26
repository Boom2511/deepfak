'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface RegionAnnotation {
  region_id: string;
  region_name_th: string;
  region_name_en: string;
  avg_attention: number;
  attention_level: 'high' | 'moderate' | 'low';
  bbox?: number[];
}

interface AnnotatedHeatmapProps {
  heatmapImage: string;
  suspiciousRegions: RegionAnnotation[];
  showAnnotations?: boolean;
}

export default function AnnotatedHeatmap({
  heatmapImage,
  suspiciousRegions,
  showAnnotations = true
}: AnnotatedHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 224, height: 224 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth / 224;
        setScale(newScale);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getColorByLevel = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-red-500 bg-red-500/10';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-green-500 bg-green-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Heatmap Image */}
      <div className="relative w-full aspect-square">
        <Image
          src={heatmapImage}
          alt="Annotated Heatmap"
          width={500}
          height={500}
          className="w-full h-auto object-contain"
        />

        {/* Annotations Overlay */}
        {showAnnotations && suspiciousRegions.length > 0 && (
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            viewBox="0 0 224 224"
            preserveAspectRatio="xMidYMid meet"
          >
            {suspiciousRegions.map((region, idx) => {
              if (!region.bbox) return null;

              const [x1, y1, x2, y2] = region.bbox;
              const width = x2 - x1;
              const height = y2 - y1;

              const color = region.attention_level === 'high'
                ? '#ef4444'
                : region.attention_level === 'moderate'
                ? '#f59e0b'
                : '#10b981';

              return (
                <g key={region.region_id}>
                  {/* Bounding Box */}
                  <rect
                    x={x1}
                    y={y1}
                    width={width}
                    height={height}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.8"
                  />

                  {/* Label Background */}
                  <rect
                    x={x1}
                    y={y1 - 20}
                    width={Math.max(width, 60)}
                    height="18"
                    fill={color}
                    opacity="0.9"
                    rx="2"
                  />

                  {/* Label Text */}
                  <text
                    x={x1 + 4}
                    y={y1 - 7}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                  >
                    {region.region_name_en} ({(region.avg_attention * 100).toFixed(0)}%)
                  </text>

                  {/* Attention Indicator (corner marker) */}
                  {region.attention_level === 'high' && (
                    <circle
                      cx={x2 - 5}
                      cy={y1 + 5}
                      r="4"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Legend for Annotations */}
      {showAnnotations && suspiciousRegions.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-gray-700">คำอธิบาย:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-red-500 bg-red-500/10"></div>
              <span>ความสนใจสูง</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-yellow-500 bg-yellow-500/10"></div>
              <span>ความสนใจปานกลาง</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-green-500 bg-green-500/10"></div>
              <span>ความสนใจต่ำ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
