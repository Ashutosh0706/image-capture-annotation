import { useEffect } from "react";
import { VideoOff } from "lucide-react";

const CameraView = ({ stream, videoRef, onVideoReady }) => {
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    const handleLoadedMetadata = async () => {
      try {
        await video.play();

        onVideoReady?.({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      } catch (error) {
        console.error("Video playback error:", error);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      video.pause();
      video.srcObject = null;
    };
  }, [stream, videoRef, onVideoReady]);

  if (!stream) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/70 p-8 text-center sm:min-h-[480px]">
        <div className="rounded-full bg-zinc-800 p-5">
          <VideoOff size={36} className="text-zinc-400" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            Camera is not active
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Start your camera to see the live preview here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-black sm:min-h-[480px]">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-contain"
      />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-xs font-medium text-white">LIVE PREVIEW</span>
      </div>

      <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-2 text-xs text-white backdrop-blur">
        Camera active
      </div>
    </div>
  );
};

export default CameraView;
