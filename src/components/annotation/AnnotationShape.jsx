const AnnotationShape = ({ annotation, selected, imageWidth, imageHeight }) => {
  const x = annotation.x * imageWidth;
  const y = annotation.y * imageHeight;
  const width = annotation.width * imageWidth;
  const height = annotation.height * imageHeight;

  const handles = [
    { name: "nw", x, y },
    { name: "ne", x: x + width, y },
    { name: "sw", x, y: y + height },
    { name: "se", x: x + width, y: y + height },
  ];

  return (
    <g
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
        stroke={selected ? "#facc15" : "#22c55e"}
        strokeWidth={selected ? 5 : 3}
        vectorEffect="non-scaling-stroke"
      />

      <text
        x={x}
        y={Math.max(24, y - 10)}
        fill={selected ? "#facc15" : "#22c55e"}
        fontSize={28}
        fontWeight="bold"
        paintOrder="stroke"
        stroke="#000000"
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
      >
        {annotation.label}
      </text>

      {selected &&
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

export default AnnotationShape;
