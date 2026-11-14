import { useCallback, useRef, useState, useEffect } from "react";

import {
  Trash2,
  Download,
  Square,
  MousePointer2,
  X,
  Tag,
  Layers,
} from "lucide-react";

const MIN_SIZE = 0.01;

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

const createId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

const getNormalizedPoint = (event, svg) => {
  const bounds = svg.getBoundingClientRect();

  return {
    x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),

    y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
  };
};

const createRectangle = (start, current) => {
  return {
    x: Math.min(start.x, current.x),
    y: Math.min(start.y, current.y),

    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
  };
};

const resizeRectangle = (initial, handle, deltaX, deltaY) => {
  let left = initial.x;
  let right = initial.x + initial.width;

  let top = initial.y;
  let bottom = initial.y + initial.height;

  if (handle.includes("w")) {
    left = clamp(initial.x + deltaX, 0, right - MIN_SIZE);
  }

  if (handle.includes("e")) {
    right = clamp(initial.x + initial.width + deltaX, left + MIN_SIZE, 1);
  }

  if (handle.includes("n")) {
    top = clamp(initial.y + deltaY, 0, bottom - MIN_SIZE);
  }

  if (handle.includes("s")) {
    bottom = clamp(initial.y + initial.height + deltaY, top + MIN_SIZE, 1);
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

const AnnotationCanvas = ({ image }) => {
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const [annotations, setAnnotations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tool, setTool] = useState("select");
  const [error, setError] = useState("");

  const selectedAnnotation = annotations.find(
    (annotation) => annotation.id === selectedId,
  );

  const updateAnnotation = useCallback((id, changes) => {
    setAnnotations((previous) =>
      previous.map((annotation) =>
        annotation.id === id ? { ...annotation, ...changes } : annotation,
      ),
    );
  }, []);

  const handlePointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") {
      return;
    }

    if (event.target.closest("input, button")) {
      return;
    }

    const svg = svgRef.current;

    if (!svg) return;

    const point = getNormalizedPoint(event, svg);

    const annotationGroup = event.target.closest("[data-annotation-id]");

    if (tool === "select" && annotationGroup) {
      const id = annotationGroup.dataset.annotationId;

      const annotation = annotations.find((item) => item.id === id);

      if (!annotation) return;

      setSelectedId(id);

      const resizeHandle = event.target.closest("[data-handle]");

      dragRef.current = {
        mode: resizeHandle ? "resize" : "move",
        pointerId: event.pointerId,
        start: point,
        initial: { ...annotation },
        handle: resizeHandle?.dataset.handle,
      };

      svg.setPointerCapture(event.pointerId);

      event.preventDefault();
      return;
    }

    if (tool === "select") {
      setSelectedId(null);
      return;
    }

    if (tool === "draw") {
      dragRef.current = {
        mode: "draw",
        pointerId: event.pointerId,
        start: point,
      };

      setSelectedId(null);
      setDraft(createRectangle(point, point));

      svg.setPointerCapture(event.pointerId);

      event.preventDefault();
    }
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const svg = svgRef.current;

    if (!svg) return;

    const current = getNormalizedPoint(event, svg);

    const deltaX = current.x - drag.start.x;
    const deltaY = current.y - drag.start.y;

    if (drag.mode === "draw") {
      setDraft(createRectangle(drag.start, current));

      return;
    }

    if (drag.mode === "move") {
      const { initial } = drag;

      updateAnnotation(initial.id, {
        x: clamp(initial.x + deltaX, 0, 1 - initial.width),

        y: clamp(initial.y + deltaY, 0, 1 - initial.height),
      });

      return;
    }

    if (drag.mode === "resize") {
      const resized = resizeRectangle(
        drag.initial,
        drag.handle,
        deltaX,
        deltaY,
      );

      updateAnnotation(drag.initial.id, resized);
    }
  };

  const finishPointer = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    if (drag.mode === "draw" && draft) {
      if (draft.width >= MIN_SIZE && draft.height >= MIN_SIZE) {
        const id = createId();

        const newAnnotation = {
          id,
          label: `Object ${annotations.length + 1}`,
          ...draft,
        };

        setAnnotations((previous) => [...previous, newAnnotation]);

        setSelectedId(id);
      }
    }

    dragRef.current = null;
    setDraft(null);
  };

  const deleteSelected = () => {
    if (!selectedId) return;

    setAnnotations((previous) =>
      previous.filter((annotation) => annotation.id !== selectedId),
    );

    setSelectedId(null);
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    setSelectedId(null);
    setDraft(null);
    dragRef.current = null;
  };

  const updateSelectedLabel = (value) => {
    if (!selectedId) return;

    updateAnnotation(selectedId, {
      label: value,
    });
  };

  const exportAnnotatedImage = async () => {
    setError("");

    try {
      const bitmap = await createImageBitmap(image.blob);

      const canvas = document.createElement("canvas");

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext("2d");

      if (!context) {
        bitmap.close();
        throw new Error("Unable to create export canvas.");
      }

      // Draw the original captured image.
      context.drawImage(bitmap, 0, 0);

      bitmap.close();

      annotations.forEach((annotation) => {
        const x = annotation.x * canvas.width;
        const y = annotation.y * canvas.height;

        const width = annotation.width * canvas.width;
        const height = annotation.height * canvas.height;

        context.strokeStyle = "#22c55e";
        context.lineWidth = Math.max(3, canvas.width / 500);

        context.strokeRect(x, y, width, height);

        // Draw label background.
        const fontSize = Math.max(18, canvas.width / 65);

        context.font = `bold ${fontSize}px Arial`;

        const label = annotation.label || "Object";

        const textWidth = context.measureText(label).width;

        const labelHeight = fontSize * 1.5;

        const labelY = Math.max(0, y - labelHeight);

        context.fillStyle = "#22c55e";

        context.fillRect(x, labelY, textWidth + 20, labelHeight);

        context.fillStyle = "#000000";

        context.fillText(label, x + 10, labelY + fontSize);
      });

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Image export failed."));
        }, "image/png");
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `annotated-image-${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Annotation export error:", err);

      setError(err.message || "Unable to export annotated image.");
    }
  };

  const renderAnnotation = (annotation) => {
    const isSelected = annotation.id === selectedId;

    const x = annotation.x * image.width;
    const y = annotation.y * image.height;

    const width = annotation.width * image.width;
    const height = annotation.height * image.height;

    const handles = [
      { name: "nw", x, y },
      { name: "ne", x: x + width, y },
      { name: "sw", x, y: y + height },
      { name: "se", x: x + width, y: y + height },
    ];

    return (
      <g
        key={annotation.id}
        data-annotation-id={annotation.id}
        className="cursor-move"
      >
        <rect
          data-annotation-body="true"
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(34,197,94,0.08)"
          stroke={isSelected ? "#facc15" : "#22c55e"}
          strokeWidth={isSelected ? 5 : 3}
          vectorEffect="non-scaling-stroke"
        />

        <text
          x={x}
          y={Math.max(24, y - 10)}
          fill={isSelected ? "#facc15" : "#22c55e"}
          fontSize={28}
          fontWeight="bold"
          paintOrder="stroke"
          stroke="#000000"
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
        >
          {annotation.label}
        </text>

        {isSelected &&
          handles.map((handle) => (
            <circle
              key={handle.name}
              data-handle={handle.name}
              cx={handle.x}
              cy={handle.y}
              r={12}
              fill="#facc15"
              stroke="#000000"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              className="cursor-crosshair"
            />
          ))}
      </g>
    );
  };

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-blue-400" />

            <h3 className="font-semibold text-white">Image Annotation</h3>
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            Draw rectangles around objects in your image.
          </p>
        </div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
          {annotations.length} annotation(s)
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTool("select")}
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
          onClick={() => setTool("draw")}
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
          onClick={deleteSelected}
          disabled={!selectedId}
          className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={17} />
          Delete
        </button>

        <button
          onClick={clearAnnotations}
          disabled={annotations.length === 0}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={17} />
          Clear all
        </button>
      </div>

      {/* Drawing instructions */}
      <div className="rounded-lg bg-blue-500/10 p-3 text-xs leading-5 text-blue-300">
        {tool === "draw"
          ? "Drag on the image to draw a rectangle around an object."
          : "Select a rectangle to move or resize it. Drag its corner handles to resize."}
      </div>

      {/* Image and SVG overlay */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-black"
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
          touchAction: "none",
        }}
      >
        <img
          src={image.url}
          alt="Image being annotated"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-fill"
        />

        <svg
          ref={svgRef}
          viewBox={`0 0 ${image.width} ${image.height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
        >
          {annotations.map(renderAnnotation)}

          {draft && (
            <rect
              x={draft.x * image.width}
              y={draft.y * image.height}
              width={draft.width * image.width}
              height={draft.height * image.height}
              fill="rgba(59,130,246,0.15)"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeDasharray="8 5"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>

      {/* Selected annotation editor */}
      {selectedAnnotation && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Tag size={18} className="text-yellow-400" />

            <h4 className="text-sm font-semibold text-white">
              Edit annotation label
            </h4>
          </div>

          <input
            type="text"
            value={selectedAnnotation.label}
            onChange={(event) => updateSelectedLabel(event.target.value)}
            maxLength={40}
            placeholder="Enter object name"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-zinc-500">
            Give this rectangle a meaningful name.
          </p>
        </div>
      )}

      {/* Annotation list */}
      {annotations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">Annotations</h4>

          {annotations.map((annotation, index) => (
            <button
              key={annotation.id}
              onClick={() => {
                setSelectedId(annotation.id);
                setTool("select");
              }}
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
                {Math.round(annotation.width * 100)}% ×{" "}
                {Math.round(annotation.height * 100)}%
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Export */}
      <button
        onClick={exportAnnotatedImage}
        disabled={annotations.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download size={19} />
        Export Annotated Image
      </button>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
};

export default AnnotationCanvas;
