import { useCallback, useRef, useState } from "react";

import {
  Camera,
  ShieldCheck,
  Image as ImageIcon,
  Settings2,
} from "lucide-react";

import useCamera from "./hooks/useCamera";
import useImageCapture from "./hooks/useImageCapture";

import CameraView from "./components/CameraView";
import CameraControls from "./components/CameraControls";
import CameraStatus from "./components/CameraStatus";
import CaptureControls from "./components/CaptureControls";
import ImagePreview from "./components/ImagePreview";
import useImageQuality from "./hooks/useImageQuality";
import QualityIndicator from "./components/QualityIndicator";
import AnnotationCanvas from "./components/AnnotationCanvas";
import "./App.css";

function App() {
  const {
    stream,
    status,
    error,
    facingMode,
    resolution,
    startCamera,
    stopCamera,
    switchCamera,

    torchSupported,
    torchEnabled,
    torchLoading,
    torchError,
    toggleTorch,
  } = useCamera();

  const {
    capturedImage,
    captureError,
    captureImage,
    retakeImage,
    downloadImage,
  } = useImageCapture();

  const { quality, analysisStatus, analysisError } =
    useImageQuality(capturedImage);

  const videoRef = useRef(null);

  const [videoResolution, setVideoResolution] = useState(null);

  const handleVideoReady = useCallback((dimensions) => {
    setVideoResolution(dimensions);
  }, []);

  const handleCapture = () => {
    captureImage(videoRef.current);
  };

  const handleStopCamera = () => {
    stopCamera();
    setVideoResolution(null);
  };

  const actualResolution = videoResolution || resolution;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5">
              <Camera size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Capture Studio
              </h1>

              <p className="text-xs text-zinc-500">
                Image Capture & Annotation
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 sm:flex">
            <ShieldCheck size={15} className="text-green-400" />
            Browser-based camera
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            Image Annotation
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Capture your image
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Capture high-quality images, review your photos, and retake them
            whenever required.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 space-y-5">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">
                    {capturedImage ? "Image Review" : "Camera Preview"}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    {capturedImage
                      ? "Review your captured image"
                      : "Live device camera feed"}
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-800 p-2 text-zinc-400">
                  <ImageIcon size={19} />
                </div>
              </div>

              {/* Keep the video mounted while reviewing
                  so the camera stream can be reused on retake. */}
              <div className={capturedImage ? "hidden" : ""}>
                <CameraView
                  stream={stream}
                  videoRef={videoRef}
                  onVideoReady={handleVideoReady}
                />
              </div>

              {capturedImage && (
                <ImagePreview
                  image={capturedImage}
                  onRetake={retakeImage}
                  onDownload={downloadImage}
                />
              )}

              {capturedImage && (
                <div className="mt-5">
                  <QualityIndicator
                    quality={quality}
                    analysisStatus={analysisStatus}
                    analysisError={analysisError}
                  />
                </div>
              )}

              {capturedImage && (
                <div className="mt-5">
                  <AnnotationCanvas image={capturedImage} />
                </div>
              )}

              <div className="mt-5">
                <CameraControls
                  status={status}
                  onStart={() => startCamera()}
                  onStop={handleStopCamera}
                  onSwitch={switchCamera}
                />
              </div>

              {status === "active" && !capturedImage && (
                <div className="mt-5 border-t border-zinc-800 pt-5">
                  <CaptureControls
                    onCapture={handleCapture}
                    onToggleTorch={toggleTorch}
                    torchSupported={torchSupported}
                    torchEnabled={torchEnabled}
                    torchLoading={torchLoading}
                    torchError={torchError}
                    captureError={captureError}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500">
                  Selected camera preference
                </p>

                <p className="mt-2 font-medium text-white">
                  {facingMode === "environment"
                    ? "Rear / Environment"
                    : "Front / User"}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500">Camera resolution</p>

                <p className="mt-2 font-medium text-white">
                  {actualResolution?.width
                    ? `${actualResolution.width} × ${actualResolution.height}`
                    : "Not available"}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <CameraStatus
              status={status}
              error={error}
              resolution={actualResolution}
            />

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 size={18} className="text-blue-400" />
                <h3 className="font-semibold">Camera settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500">Requested resolution</p>
                  <p className="mt-1 text-sm font-medium">1920 × 1080</p>
                </div>

                <div className="border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-500">Requested frame rate</p>
                  <p className="mt-1 text-sm font-medium">30 FPS</p>
                </div>

                <div className="border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-500">Audio</p>
                  <p className="mt-1 text-sm font-medium">Disabled</p>
                </div>

                <div className="border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-500">Torch support</p>
                  <p className="mt-1 text-sm font-medium">
                    {status !== "active"
                      ? "Camera inactive"
                      : torchSupported
                        ? torchEnabled === null
                          ? "Supported · State unknown"
                          : torchEnabled
                            ? "Supported · On"
                            : "Supported · Off"
                        : "Not supported"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-400" />

                <h3 className="text-sm font-semibold">Privacy information</h3>
              </div>

              <p className="mt-3 text-xs leading-6 text-zinc-400">
                Images are captured and processed locally in your browser. This
                version does not upload your captured images to a server.
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-10 border-t border-zinc-800 pt-5 text-center text-xs text-zinc-600">
          Capture Studio · Ashutosh Vishwakarma · 2026
        </footer>
      </main>
    </div>
  );
}

export default App;
