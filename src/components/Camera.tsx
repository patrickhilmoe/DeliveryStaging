import React, { useRef, useCallback, useState } from 'react';
import { Camera as CameraIcon, Square, RotateCcw } from 'lucide-react';

interface CameraProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  React.useEffect(() => {
    if (facingMode && !isActive) {
      startCamera();
    }
  }, [facingMode, startCamera, isActive]);

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CameraIcon className="w-5 h-5 text-blue-600" />
          Camera
        </h2>
        {isActive && (
          <button
            onClick={switchCamera}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Switch camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none opacity-50" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={capturePhoto}
                disabled={isProcessing}
                className="bg-white text-gray-800 hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Square className="w-6 h-6" fill="currentColor" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={startCamera}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <CameraIcon className="w-5 h-5" />
              Start Camera
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};