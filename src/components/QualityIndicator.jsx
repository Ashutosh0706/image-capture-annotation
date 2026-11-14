import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Gauge,
  Ruler,
  FileImage,
  Sun,
  LoaderCircle,
} from "lucide-react";

const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} Bytes`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const statusConfig = {
  good: {
    label: "Good",
    description: "All measured quality checks passed.",
    icon: CheckCircle2,
    color: "text-green-400",
    background: "bg-green-500/10",
    bar: "bg-green-500",
  },

  acceptable: {
    label: "Acceptable",
    description: "The image is usable, but some improvements are recommended.",
    icon: AlertTriangle,
    color: "text-yellow-400",
    background: "bg-yellow-500/10",
    bar: "bg-yellow-500",
  },

  poor: {
    label: "Poor",
    description: "One or more quality checks failed.",
    icon: AlertCircle,
    color: "text-red-400",
    background: "bg-red-500/10",
    bar: "bg-red-500",
  },
};

const levelStyles = {
  good: "text-green-400 bg-green-500/10",
  acceptable: "text-yellow-400 bg-yellow-500/10",
  poor: "text-red-400 bg-red-500/10",
};

const MetricCard = ({ title, value, level, icon: Icon, description }) => {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <Icon size={17} />
          <span className="text-sm">{title}</span>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
            levelStyles[level]
          }`}
        >
          {level}
        </span>
      </div>

      <p className="mt-4 text-xl font-semibold text-white">{value}</p>

      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </div>
  );
};

const QualityIndicator = ({ quality, analysisStatus, analysisError }) => {
  if (analysisStatus === "idle") {
    return null;
  }

  if (analysisStatus === "analyzing") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3">
          <LoaderCircle size={22} className="animate-spin text-blue-400" />

          <div>
            <h3 className="font-semibold text-white">
              Analyzing image quality
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Checking resolution, file size and brightness...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (analysisStatus === "error") {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <p className="text-sm font-semibold text-red-300">
          Image analysis failed
        </p>

        <p className="mt-2 text-sm text-red-200">{analysisError}</p>
      </div>
    );
  }

  if (!quality) return null;

  const config = statusConfig[quality.status];
  const StatusIcon = config.icon;

  const { metrics } = quality;

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Gauge size={20} className="text-blue-400" />

        <h3 className="font-semibold text-white">Image Quality Assessment</h3>
      </div>

      {/* Overall score */}
      <div className={`rounded-xl p-4 ${config.background}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-300">Overall quality score</p>

            <p className={`mt-2 text-4xl font-bold ${config.color}`}>
              {quality.score}
              <span className="text-lg">/100</span>
            </p>
          </div>

          <div className="text-right">
            <StatusIcon size={30} className={config.color} />

            <p className={`mt-2 font-semibold ${config.color}`}>
              {config.label}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
            style={{ width: `${quality.score}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-zinc-300">{config.description}</p>
      </div>

      {/* Individual metrics */}
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard
          title="Resolution"
          value={`${metrics.resolution.width} × ${metrics.resolution.height} px`}
          level={metrics.resolution.level}
          icon={Ruler}
          description="Captured image dimensions"
        />

        <MetricCard
          title="File size"
          value={formatFileSize(metrics.fileSize.bytes)}
          level={metrics.fileSize.level}
          icon={FileImage}
          description="JPEG file size"
        />

        <MetricCard
          title="Brightness"
          value={`${metrics.brightness.value} / 255`}
          level={metrics.brightness.level}
          icon={Sun}
          description="Average sampled pixel luminance"
        />
      </div>

      {/* Suggestions */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h4 className="font-semibold text-white">Quality feedback</h4>

        <ul className="mt-3 space-y-3">
          {quality.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm leading-6 text-zinc-400"
            >
              <span className="mt-1 text-blue-400">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs leading-5 text-zinc-500">
        Assessment is based on resolution, file size and average image
        brightness. It does not guarantee focus, sharpness or suitability for
        every annotation task.
      </p>
    </section>
  );
};

export default QualityIndicator;
