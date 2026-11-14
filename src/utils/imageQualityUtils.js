
export const QUALITY_THRESHOLDS = {
  resolution: {
    good: {
      width: 1920,
      height: 1080,
    },
    acceptable: {
      width: 1280,
      height: 720,
    },
  },

  fileSize: {
    good: {
      min: 200 * 1024,
      max: 8 * 1024 * 1024,
    },
    acceptable: {
      min: 100 * 1024,
      max: 10 * 1024 * 1024,
    },
  },

  brightness: {
    good: {
      min: 70,
      max: 200,
    },
    acceptable: {
      min: 40,
      max: 220,
    },
  },
};

const QUALITY_WEIGHTS = {
  resolution: 40,
  fileSize: 25,
  brightness: 35,
};

// Supports both landscape and portrait images.
const getResolutionLevel = (width, height) => {
  const longSide = Math.max(width, height);
  const shortSide = Math.min(width, height);

  const { good, acceptable } = QUALITY_THRESHOLDS.resolution;

  if (
    longSide >= good.width &&
    shortSide >= good.height
  ) {
    return "good";
  }

  if (
    longSide >= acceptable.width &&
    shortSide >= acceptable.height
  ) {
    return "acceptable";
  }

  return "poor";
};

const getFileSizeLevel = (size) => {
  const { good, acceptable } = QUALITY_THRESHOLDS.fileSize;

  if (size >= good.min && size <= good.max) {
    return "good";
  }

  if (
    size >= acceptable.min &&
    size <= acceptable.max
  ) {
    return "acceptable";
  }

  return "poor";
};

const getBrightnessLevel = (brightness) => {
  const { good, acceptable } = QUALITY_THRESHOLDS.brightness;

  if (
    brightness >= good.min &&
    brightness <= good.max
  ) {
    return "good";
  }

  if (
    brightness >= acceptable.min &&
    brightness <= acceptable.max
  ) {
    return "acceptable";
  }

  return "poor";
};

// Calculate average brightness by sampling pixels.
const calculateBrightness = (imageData) => {
  const pixels = imageData.data;

  let totalBrightness = 0;
  let sampledPixels = 0;

  // RGBA data has 4 values per pixel.
  // Sampling every 16 pixels reduces processing.
  const sampleStep = 16 * 4;

  for (let i = 0; i < pixels.length; i += sampleStep) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];

    // Perceived luminance formula.
    const luminance =
      0.2126 * red +
      0.7152 * green +
      0.0722 * blue;

    totalBrightness += luminance;
    sampledPixels++;
  }

  if (sampledPixels === 0) {
    return 0;
  }

  return Number(
    (totalBrightness / sampledPixels).toFixed(2)
  );
};

const analyzeImageBrightness = async (blob) => {
  let bitmap;

  try {
    bitmap = await createImageBitmap(blob);

    // Analyze a smaller copy for performance.
    const maxDimension = 320;

    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height)
    );

    const width = Math.max(
      1,
      Math.round(bitmap.width * scale)
    );

    const height = Math.max(
      1,
      Math.round(bitmap.height * scale)
    );

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) {
      throw new Error("Unable to create image analysis canvas.");
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const imageData = context.getImageData(
      0,
      0,
      width,
      height
    );

    return calculateBrightness(imageData);
  } finally {
    bitmap?.close();
  }
};

const getMetricScore = (level, weight) => {
  if (level === "good") return weight;

  if (level === "acceptable") {
    return Math.round(weight * 0.7);
  }

  return 0;
};

const getQualityStatus = (score, metrics) => {
  // Any failed metric makes the overall result poor.
  if (
    metrics.resolution.level === "poor" ||
    metrics.fileSize.level === "poor" ||
    metrics.brightness.level === "poor"
  ) {
    return "poor";
  }

  if (score >= 80) return "good";

  return "acceptable";
};

const getSuggestions = (metrics) => {
  const suggestions = [];

  if (metrics.resolution.level === "poor") {
    suggestions.push(
      "The image resolution is low. Use a camera with a higher resolution."
    );
  } else if (metrics.resolution.level === "acceptable") {
    suggestions.push(
      "The image resolution is acceptable, but a higher resolution is recommended."
    );
  }

  if (metrics.fileSize.level === "poor") {
    if (metrics.fileSize.bytes < 100 * 1024) {
      suggestions.push(
        "The image file is unusually small. Check whether the image has been compressed too much."
      );
    } else {
      suggestions.push(
        "The image file is very large. Consider reducing image dimensions or compression settings if needed."
      );
    }
  } else if (metrics.fileSize.level === "acceptable") {
    suggestions.push(
      "The image file size is outside the preferred range, but still acceptable."
    );
  }

  if (metrics.brightness.level === "poor") {
    if (metrics.brightness.value < 40) {
      suggestions.push(
        "The image is too dark. Improve the lighting or use the supported camera torch."
      );
    } else {
      suggestions.push(
        "The image is too bright. Reduce the lighting or adjust camera exposure if supported."
      );
    }
  } else if (metrics.brightness.level === "acceptable") {
    suggestions.push(
      "The image brightness could be improved for better visibility."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "All measured image quality checks passed."
    );
  }

  return suggestions;
};

export const analyzeImageQuality = async (image) => {
  if (!image?.blob) {
    throw new Error("No captured image is available for analysis.");
  }

  const { width, height, size } = image;

  const brightness = await analyzeImageBrightness(image.blob);

  const metrics = {
    resolution: {
      width,
      height,
      level: getResolutionLevel(width, height),
    },

    fileSize: {
      bytes: size,
      level: getFileSizeLevel(size),
    },

    brightness: {
      value: brightness,
      level: getBrightnessLevel(brightness),
    },
  };

  const score =
    getMetricScore(
      metrics.resolution.level,
      QUALITY_WEIGHTS.resolution
    ) +
    getMetricScore(
      metrics.fileSize.level,
      QUALITY_WEIGHTS.fileSize
    ) +
    getMetricScore(
      metrics.brightness.level,
      QUALITY_WEIGHTS.brightness
    );

  const status = getQualityStatus(score, metrics);

  const suggestions = getSuggestions(metrics);

  return {
    score,
    status,
    metrics,
    suggestions,
    analyzedAt: new Date(),
  };
};