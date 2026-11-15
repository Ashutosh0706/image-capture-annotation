import { Download } from "lucide-react";

const AnnotationExportButton = ({ disabled, onExport }) => (
  <button
    onClick={onExport}
    disabled={disabled}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
  >
    <Download size={19} />
    Export Annotated Image
  </button>
);

export default AnnotationExportButton;
