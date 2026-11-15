const MIN_SIZE = 0.01;

export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export const createId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random()}`;
};

export const getNormalizedPoint = (event, svg) => {
  const bounds = svg.getBoundingClientRect();

  return {
    x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
    y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
  };
};

export const createRectangle = (start, current) => ({
  x: Math.min(start.x, current.x),
  y: Math.min(start.y, current.y),
  width: Math.abs(current.x - start.x),
  height: Math.abs(current.y - start.y),
});

export const resizeRectangle = (initial, handle, deltaX, deltaY) => {
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

export { MIN_SIZE };
