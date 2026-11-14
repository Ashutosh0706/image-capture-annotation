
import { useEffect, useRef, useState } from "react";

import { analyzeImageQuality } from "../utils/imageQualityUtils";

const useImageQuality = (capturedImage) => {
  const [quality, setQuality] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [analysisError, setAnalysisError] = useState("");

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (!capturedImage) {
      setQuality(null);
      setAnalysisStatus("idle");
      setAnalysisError("");
      return;
    }

    const runAnalysis = async () => {
      setAnalysisStatus("analyzing");
      setAnalysisError("");
      setQuality(null);

      try {
        const result = await analyzeImageQuality(capturedImage);

        // Prevent an older analysis from updating newer state.
        if (requestId !== requestIdRef.current) {
          return;
        }

        setQuality(result);
        setAnalysisStatus("completed");
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error("Image quality analysis error:", error);

        setAnalysisStatus("error");
        setAnalysisError(
          error.message || "Unable to analyze image quality."
        );
      }
    };

    runAnalysis();

    return () => {
      // Invalidate any previous analysis.
      requestIdRef.current += 1;
    };
  }, [capturedImage]);

  return {
    quality,
    analysisStatus,
    analysisError,
  };
};

export default useImageQuality;