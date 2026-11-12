import { Camera, CameraOff, RefreshCw } from "lucide-react";

const CameraControls = ({ status, onStart, onStop, onSwitch }) => {
  const isActive = status === "active";
  const isLoading = status === "loading";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {isLoading ? (
        <button
          onClick={onStop}
          className="rounded-xl border border-zinc-700 px-5 py-3 text-white"
        >
          Cancel Request
        </button>
      ) : !isActive ? (
        <button
          onClick={onStart}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          <Camera size={20} />
          Start Camera
        </button>
      ) : (
        <>
          <button
            onClick={onSwitch}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 text-white"
          >
            <RefreshCw size={18} />
            Switch Camera
          </button>

          <button
            onClick={onStop}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            <CameraOff size={18} />
            Stop Camera
          </button>
        </>
      )}
    </div>
  );
};

export default CameraControls;
