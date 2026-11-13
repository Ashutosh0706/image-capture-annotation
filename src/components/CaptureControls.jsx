
import {
  Camera,
  Flashlight,
  FlashlightOff,
  LoaderCircle,
} from "lucide-react";

const CaptureControls = ({
  onCapture,
  onToggleTorch,
  torchSupported,
  torchEnabled,
  torchLoading,
  torchError,
  captureError,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onCapture}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          <Camera size={20} />
          Capture Image
        </button>

        {torchSupported && (
          <button
            onClick={onToggleTorch}
            disabled={torchLoading}
            className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              torchEnabled === true
                ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                : "border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            {torchLoading ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : torchEnabled === true ? (
              <Flashlight size={19} />
            ) : (
              <FlashlightOff size={19} />
            )}

            {torchLoading
              ? "Updating..."
              : torchEnabled === true
                ? "Torch On"
                : torchEnabled === false
                  ? "Torch Off"
                  : "Torch State Unknown"}
          </button>
        )}
      </div>

      {torchSupported && torchEnabled === null && (
        <p className="text-center text-xs text-yellow-400">
          Your browser has not reported the actual torch state.
        </p>
      )}

      {!torchSupported && (
        <p className="text-center text-xs text-zinc-500">
          Torch control is not supported by the active camera.
        </p>
      )}

      {torchError && (
        <p className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-300">
          {torchError}
        </p>
      )}

      {captureError && (
        <p className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-300">
          {captureError}
        </p>
      )}
    </div>
  );
};

export default CaptureControls;
