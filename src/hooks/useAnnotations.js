import { useCallback, useRef, useState } from "react";
import {
  clamp,
  createId,
  createRectangle,
  getNormalizedPoint,
  MIN_SIZE,
  resizeRectangle,
} from "../utils/annotationGeometry";

const useAnnotations = () => {
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const [annotations, setAnnotations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tool, setTool] = useState("select");

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
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if (event.target.closest("input, button")) return;

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
    if (!drag || drag.pointerId !== event.pointerId) return;

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
    if (!drag || drag.pointerId !== event.pointerId) return;

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
    updateAnnotation(selectedId, { label: value });
  };

  const selectAnnotation = (id) => {
    setSelectedId(id);
    setTool("select");
  };

  return {
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
  };
};

export default useAnnotations;
