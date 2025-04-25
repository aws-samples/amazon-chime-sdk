// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useRef, useEffect } from 'react';
import { useLogger, useContentShareState } from 'amazon-chime-sdk-component-library-react';

const AnnotatedContentShare: React.FC = () => {
  const logger = useLogger();
  const { tiles } = useContentShareState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingTileIdRef = useRef<number | null>();
  const textPositionRef = useRef(0);

  const findContentShareVideo = (tileId: number) => {
    const contentShareContainer = document.querySelector(`[class*="ch-content-share--${tileId}"]`);
    return contentShareContainer?.querySelector('video');
  };

  useEffect(() => {
    if (!tiles || tiles.length === 0) {
      return;
    }
    const canvas = canvasRef.current!;

    let recordingTileId = recordingTileIdRef.current;
    if (!recordingTileId) {
      const tileId = tiles[0];
      recordingTileIdRef.current = tileId;
      recordingTileId = tileId;
    }

    const contentShareVideo = findContentShareVideo(recordingTileId)!;
    if (contentShareVideo?.videoWidth > 0 && contentShareVideo?.videoHeight > 0) {
      canvas.width = contentShareVideo.videoWidth;
      canvas.height = contentShareVideo.videoHeight;
    }

    const drawFrame = () => {
      const ctx = canvas.getContext('2d')!;

      if (contentShareVideo) {
        // Draw content share
        ctx.drawImage(contentShareVideo, 0, 0, canvas.width, canvas.height);
      }

      // Draw annotation
      const padding = 20;
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
      ctx.strokeRect(padding, padding, canvas.width - padding * 2, canvas.height - padding * 2);

      const drawAnnotation = () => {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        const text = 'Annotated Content';
        const textWidth = ctx.measureText(text).width;
        const position = textPositionRef.current;
        const x = canvas.width - position;
        const y = padding + 30;
        ctx.fillText(text, x, y);
        textPositionRef.current += 2;
        if (x < -textWidth) {
          textPositionRef.current = 0;
        }
      };

      drawAnnotation();
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, [tiles, logger]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (tiles.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: `600px`,
        height: `400px`,
        pointerEvents: 'auto',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        id="annotated-content-share-preview"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      />
    </div>
  );
};

export default AnnotatedContentShare;
