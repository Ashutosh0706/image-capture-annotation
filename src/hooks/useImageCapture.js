
import { useCallback, useEffect, useRef, useState } from "react";

const useImageCapture = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [captureError, setCaptureError] = useState("");

  const objectUrlRef = useRef(null);

  const captureImage = useCallback(async (videoElement) => {
    setCaptureError("");

    if (!videoElement) {
      setCaptureError("Camera video is not available.");
      return;
    }

    if (
      videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !videoElement.videoWidth ||
      !videoElement.videoHeight
    ) {
      setCaptureError(
        "Camera is not ready yet. Please wait and try again."
      );
      return;
    }

    try {
      const canvas = document.createElement("canvas");

      // Use the actual video frame dimensions.
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create canvas context.");
      }

      context.drawImage(
        videoElement,
        0,
        0,
        width,
        height
      );

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error("Image creation failed."));
            }
          },
          "image/jpeg",
          0.95
        );
      });

      // Release the previous image URL before replacing it.
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const imageUrl = URL.createObjectURL(blob);

      objectUrlRef.current = imageUrl;

      setCapturedImage({
        blob,
        url: imageUrl,
        width,
        height,
        size: blob.size,
        format: "JPEG",
        capturedAt: new Date(),
      });
    } catch (error) {
      console.error("Image capture error:", error);

      setCaptureError(
        error.message || "Unable to capture the image."
      );
    }
  }, []);

  const retakeImage = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setCapturedImage(null);
    setCaptureError("");
  }, []);

  const downloadImage = useCallback(() => {
    if (!capturedImage) return;

    const link = document.createElement("a");

    link.href = capturedImage.url;
    link.download = `capture-${Date.now()}.jpg`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [capturedImage]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  return {
    capturedImage,
    captureError,
    captureImage,
    retakeImage,
    downloadImage,
  };
};

export default useImageCapture;