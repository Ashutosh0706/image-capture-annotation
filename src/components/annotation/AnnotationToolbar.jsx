import { MousePointer2, Square, Trash2, X } from "lucide-react";

const AnnotationToolbar = ({
  tool,
  onToolChange,
  hasSelection,
  annotationCount,
  onDelete,
  onClear,
}) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onToolChange("select")}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
        tool === "select"
          ? "bg-blue-600 text-white"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      }`}
    >
      <MousePointer2 size={17} />
      Select
    </button>

    <button
      onClick={() => onToolChange("draw")}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
        tool === "draw"
          ? "bg-blue-600 text-white"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      }`}
    >
      <Square size={17} />
      Draw rectangle
    </button>

    <button
      onClick={onDelete}
      disabled={!hasSelection}
      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 size={17} />
      Delete
    </button>

    <button
      onClick={onClear}
      disabled={annotationCount === 0}
      className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <X size={17} />
      Clear all
    </button>
  </div>
);

export default AnnotationToolbar;
