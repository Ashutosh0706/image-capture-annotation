
import {
  Camera,
  Download,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";

const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} Bytes`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ImagePreview = ({
  image,
  onRetake,
  onDownload,
}) => {
  if (!image) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 p-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-green-400" />

            <h3 className="font-semibold text-white">
              Captured Image
            </h3>
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            Your image is ready for review.
          </p>
        </div>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
          Captured
        </span>
      </div>

      <div className="bg-black p-2 sm:p-4">
        <img
          src={image.url}
          alt="Captured camera frame"
          className="mx-auto max-h-[500px] w-full object-contain"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-zinc-500">Resolution</p>
          <p className="mt-1 text-sm font-medium text-white">
            {image.width} × {image.height}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-500">File size</p>
          <p className="mt-1 text-sm font-medium text-white">
            {formatFileSize(image.size)}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-500">Format</p>
          <p className="mt-1 text-sm font-medium text-white">
            {image.format}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-zinc-800 p-4">
        <button
          onClick={onRetake}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          <RotateCcw size={18} />
          Retake
        </button>

        <button
          onClick={onDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Download size={18} />
          Download
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
