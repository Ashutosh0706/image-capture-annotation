import { useState } from "react";
import { Layers } from "lucide-react";

import useAnnotations from "../hooks/useAnnotations";
import { exportAnnotatedImage } from "../utils/annotationExport";

import AnnotationToolbar from "./annotation/AnnotationToolbar";
import AnnotationImageStage from "./annotation/AnnotationImageStage";
import AnnotationEditor from "./annotation/AnnotationEditor";
import AnnotationList from "./annotation/AnnotationList";
import AnnotationExportButton from "./annotation/AnnotationExportButton";

const AnnotationCanvas = ({ image }) => {
  const [error, setError] = useState("");

  const {
    annotations,
    selectedId,
    selectedAnnotation,
    draft,
    tool,
    svgRef,
    setTool,
    handlePointerDown,
    handlePointerMove,
    finishPointer,
    deleteSelected,
    clearAnnotations,
    updateSelectedLabel,
    selectAnnotation,
  } = useAnnotations();

  const handleExport = async () => {
    setError("");

    try {
      await exportAnnotatedImage(image, annotations);
    } catch (err) {
      console.error("Annotation export error:", err);
      setError(err.message || "Unable to export annotated image.");
    }
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

      <AnnotationToolbar
        tool={tool}
        onToolChange={setTool}
        hasSelection={Boolean(selectedId)}
        annotationCount={annotations.length}
        onDelete={deleteSelected}
        onClear={clearAnnotations}
      />

      <div className="rounded-lg bg-blue-500/10 p-3 text-xs leading-5 text-blue-300">
        {tool === "draw"
          ? "Drag on the image to draw a rectangle around an object."
          : "Select a rectangle to move or resize it. Drag its corner handles to resize."}
      </div>

      <AnnotationImageStage
        image={image}
        annotations={annotations}
        selectedId={selectedId}
        draft={draft}
        svgRef={svgRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
      />

      <AnnotationEditor
        annotation={selectedAnnotation}
        onLabelChange={updateSelectedLabel}
      />

      <AnnotationList
        annotations={annotations}
        selectedId={selectedId}
        onSelect={selectAnnotation}
      />

      <AnnotationExportButton
        disabled={annotations.length === 0}
        onExport={handleExport}
      />

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
};

export default AnnotationCanvas;
