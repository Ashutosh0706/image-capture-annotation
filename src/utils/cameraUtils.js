
export const isCameraSupported = () => {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
};

export const getCameraErrorMessage = (error) => {
  switch (error?.name) {
    case "NotAllowedError":
      return "Camera permission was denied. Please allow camera access in your browser settings.";

    case "NotFoundError":
      return "No camera was found on this device.";

    case "NotReadableError":
      return "Your camera is currently being used by another application.";

    case "OverconstrainedError":
      return "The requested camera settings are not supported by this device.";

    case "SecurityError":
      return "Camera access is blocked by the browser's security settings.";

    case "AbortError":
      return "Camera access was interrupted. Please try again.";

    default:
      return error?.message || "Unable to access the camera. Please try again.";
  }
};
