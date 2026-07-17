import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start the camera stream
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('ไม่สามารถเข้าถึงกล้องได้ โปรดตรวจสอบการอนุญาตสิทธิ์การใช้งานกล้องในเบราว์เซอร์ของคุณ');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Draw square crop
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;

        canvas.width = 300;
        canvas.height = 300;

        context.drawImage(
          video,
          startX,
          startY,
          size,
          size,
          0,
          0,
          300,
          300
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-400" />
            ถ่ายรูปผู้เล่น
          </h3>
          <button
            onClick={() => {
              if (stream) stream.getTracks().forEach((track) => track.stop());
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Camera Stage */}
        <div className="relative flex aspect-square w-full items-center justify-center bg-black">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-rose-400">
              <AlertCircle className="mb-3 h-12 w-12 text-rose-500" />
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={onClose}
                className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          ) : !capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 border-4 border-emerald-500/30 m-8 rounded-full pointer-events-none border-dashed animate-pulse"></div>
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Footer Actions */}
        <div className="bg-slate-950 p-6 flex justify-center gap-4 border-t border-slate-900">
          {!error && !capturedImage && (
            <button
              onClick={takeSnapshot}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg hover:bg-emerald-400 active:scale-95 transition-all"
            >
              <Camera className="h-5 w-5" />
              กดถ่ายภาพ
            </button>
          )}

          {capturedImage && (
            <>
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                ถ่ายใหม่
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white shadow-lg hover:bg-emerald-400 active:scale-95 transition-all"
              >
                <Check className="h-4 w-4" />
                ใช้รูปนี้
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
