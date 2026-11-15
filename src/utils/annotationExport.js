export const exportAnnotatedImage = async (image, annotations) => {
  const bitmap = await createImageBitmap(image.blob);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create export canvas.");

    // Draw the original captured image.
    context.drawImage(bitmap, 0, 0);

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
  } finally {
    bitmap.close();
  }
};
