import { Tag } from "lucide-react";

const AnnotationEditor = ({ annotation, onLabelChange }) => {
  if (!annotation) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Tag size={18} className="text-yellow-400" />
        <h4 className="text-sm font-semibold text-white">
          Edit annotation label
        </h4>
      </div>

      <input
        type="text"
        value={annotation.label}
        onChange={(event) => onLabelChange(event.target.value)}
        maxLength={40}
        placeholder="Enter object name"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
      />

      <p className="mt-2 text-xs text-zinc-500">
        Give this rectangle a meaningful name.
      </p>
    </div>
  );
};

export default AnnotationEditor;
