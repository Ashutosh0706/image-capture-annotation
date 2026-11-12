
import {
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Camera,
} from "lucide-react";

const CameraStatus = ({ status, error, resolution }) => {
  const statusConfig = {
    idle: {
      label: "Camera inactive",
      color: "text-zinc-400",
      icon: <Camera size={17} />,
    },
    loading: {
      label: "Connecting to camera...",
      color: "text-yellow-400",
      icon: <LoaderCircle size={17} className="animate-spin" />,
    },
    active: {
      label: "Camera connected",
      color: "text-green-400",
      icon: <CheckCircle2 size={17} />,
    },
    error: {
      label: "Camera unavailable",
      color: "text-red-400",
      icon: <AlertCircle size={17} />,
    },
  };

  const current = statusConfig[status];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">

      <div className="flex items-center justify-between gap-3">
        <div className={`flex items-center gap-2 text-sm font-medium ${current.color}`}>
          {current.icon}
          {current.label}
        </div>

        {status === "active" && (
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
            Ready
          </span>
        )}
      </div>

      {status === "error" && (
        <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {status === "active" && resolution?.width && (
        <div className="mt-4 border-t border-zinc-800 pt-3">
          <p className="text-xs text-zinc-500">
            Current camera resolution
          </p>

          <p className="mt-1 font-medium text-white">
            {resolution.width} × {resolution.height} px
          </p>
        </div>
      )}

      {status === "idle" && (
        <p className="mt-2 text-xs text-zinc-500">
          Camera has not been started yet.
        </p>
      )}

    </div>
  );
};

export default CameraStatus;
