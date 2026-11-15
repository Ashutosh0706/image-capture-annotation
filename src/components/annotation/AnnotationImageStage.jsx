import AnnotationShape from "./AnnotationShape";

const AnnotationImageStage = ({
  image,
  annotations,
  selectedId,
  draft,
  svgRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => (
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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {annotations.map((annotation) => (
        <AnnotationShape
          key={annotation.id}
          annotation={annotation}
          selected={annotation.id === selectedId}
          imageWidth={image.width}
          imageHeight={image.height}
        />
      ))}

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
);

export default AnnotationImageStage;
