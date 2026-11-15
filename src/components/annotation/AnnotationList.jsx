const AnnotationList = ({ annotations, selectedId, onSelect }) => {
  if (annotations.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-white">Annotations</h4>

      {annotations.map((annotation, index) => (
        <button
          key={annotation.id}
          onClick={() => onSelect(annotation.id)}
          className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
            annotation.id === selectedId
              ? "border-yellow-500/50 bg-yellow-500/5"
              : "border-zinc-800 bg-zinc-950 hover:bg-zinc-800"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-500/10 text-xs font-semibold text-green-400">
              {index + 1}
            </span>
            <span className="truncate text-sm text-white">
              {annotation.label}
            </span>
          </div>

          <span className="shrink-0 text-xs text-zinc-500">
            {Math.round(annotation.width * 100)}% × {" "}
            {Math.round(annotation.height * 100)}%
          </span>
        </button>
      ))}
    </div>
  );
};

export default AnnotationList;
