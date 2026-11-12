
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCameraErrorMessage,
  isCameraSupported,
} from "../utils/cameraUtils";

const CAMERA_CONSTRAINTS = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30, max: 30 },
};

const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [resolution, setResolution] = useState(null);

  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(null);
  const [torchLoading, setTorchLoading] = useState(false);
  const [torchError, setTorchError] = useState("");

  const streamRef = useRef(null);
  const requestIdRef = useRef(0);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setStream(null);
    setResolution(null);
    setTorchSupported(false);
    setTorchEnabled(null);
    setTorchError("");
  }, []);

  const startCamera = useCallback(
    async (selectedFacingMode = facingMode) => {
      const requestId = ++requestIdRef.current;

      setError("");
      setTorchError("");

      if (!isCameraSupported()) {
        setStatus("error");
        setError(
          "Camera is unavailable. Use a supported browser over HTTPS or localhost."
        );
        return;
      }

      releaseStream();
      setStatus("loading");

      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              ...CAMERA_CONSTRAINTS,
              facingMode: { ideal: selectedFacingMode },
            },
          });

        // Ignore an older camera request.
        if (requestId !== requestIdRef.current) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        const videoTrack = mediaStream.getVideoTracks()[0];

        if (!videoTrack) {
          mediaStream.getTracks().forEach((track) => track.stop());
          throw new Error("No video track was returned.");
        }

        const settings = videoTrack.getSettings();

        let capabilities = {};

        try {
          capabilities = videoTrack.getCapabilities?.() || {};
        } catch {
          capabilities = {};
        }

        const supportsTorch = capabilities.torch === true;

        streamRef.current = mediaStream;

        setStream(mediaStream);
        setFacingMode(selectedFacingMode);

        setResolution({
          width: settings.width || null,
          height: settings.height || null,
        });

        setTorchSupported(supportsTorch);

        // null means the browser does not expose the actual torch state.
        setTorchEnabled(
          typeof settings.torch === "boolean"
            ? settings.torch
            : null
        );

        setStatus("active");

        videoTrack.addEventListener(
          "ended",
          () => {
            if (requestId !== requestIdRef.current) return;

            streamRef.current = null;
            setStream(null);
            setResolution(null);
            setTorchSupported(false);
            setTorchEnabled(null);
            setStatus("error");
            setError(
              "Camera connection was interrupted. Please reconnect."
            );
          },
          { once: true }
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        console.error("Camera error:", err);
        setStatus("error");
        setError(getCameraErrorMessage(err));
      }
    },
    [facingMode, releaseStream]
  );

  const stopCamera = useCallback(() => {
    requestIdRef.current += 1;
    releaseStream();
    setStatus("idle");
    setError("");
  }, [releaseStream]);

  const switchCamera = useCallback(async () => {
    const nextFacingMode =
      facingMode === "environment" ? "user" : "environment";

    await startCamera(nextFacingMode);
  }, [facingMode, startCamera]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];

    if (!track || !torchSupported || torchLoading) {
      return;
    }

    const nextTorchState = torchEnabled !== true;

    setTorchLoading(true);
    setTorchError("");

    try {
      await track.applyConstraints({
        advanced: [{ torch: nextTorchState }],
      });

      // Read the actual state reported by the browser.
      const actualState = track.getSettings().torch;

      setTorchEnabled(
        typeof actualState === "boolean" ? actualState : null
      );
    } catch (err) {
      console.error("Torch error:", err);

      setTorchError(
        "Unable to change the torch. Your camera or browser may not support this operation."
      );
    } finally {
      setTorchLoading(false);
    }
  }, [torchSupported, torchEnabled, torchLoading]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      }
    };
  }, []);

  return {
    stream,
    status,
    error,
    facingMode,
    resolution,
    startCamera,
    stopCamera,
    switchCamera,

    torchSupported,
    torchEnabled,
    torchLoading,
    torchError,
    toggleTorch,
  };
};

export default useCamera;
