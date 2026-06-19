import React, { useState } from "react";
import { PenLine, CheckCircle2 } from "lucide-react";

interface ReflectionFormProps {
  onSaveReflection: (text: string) => void;
  refleksiSaved: boolean;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  onSaveReflection,
  refleksiSaved,
}) => {
  const [refleksiText, setRefleksiText] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");

  const MIN_CHARS = 10;

  const handleSubmit = () => {
    const trimmed = refleksiText.trim();
    if (trimmed.length < MIN_CHARS) {
      setValidationError(
        `Refleksi minimal ${MIN_CHARS} karakter. Saat ini baru ${trimmed.length} karakter.`
      );
      return;
    }
    setValidationError("");
    onSaveReflection(trimmed);
    setShowSuccessModal(true);
  };

  if (refleksiSaved) {
    return (
      <div className="bg-brand-50/50 dark:bg-brand-950/10 border border-brand-200 dark:border-brand-900 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
        <div className="p-1.5 bg-brand-100 dark:bg-brand-900/40 rounded-full text-brand-500">
          <CheckCircle2 className="size-4" />
        </div>
        <div className="text-xs text-brand-700 dark:text-brand-300">
          <span className="font-bold">Refleksi telah disimpan.</span>{" "}
          Hasil refleksi dan simulasi Anda tersimpan di Riwayat Simulasi. Silakan
          perhatikan komentar dan masukan dari guru.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-lg">
            <PenLine className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white font-heading">
              Refleksi Pembelajaran
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Ceritakan pengalaman dan pemahaman Anda setelah menyelesaikan simulasi ini.
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Ceritakan refleksi Anda{" "}
            <span className="text-gray-400 font-normal">(min. {MIN_CHARS} karakter)</span>
          </label>
          <textarea
            value={refleksiText}
            onChange={(e) => {
              setRefleksiText(e.target.value);
              if (validationError) setValidationError("");
            }}
            placeholder="Tuliskan apa yang Anda pelajari, bagian mana yang paling berkesan atau menantang, dan bagaimana Anda akan menerapkan pemahaman ini ke depannya..."
            rows={4}
            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition resize-none"
          />
          <div className="flex justify-between items-center">
            {validationError ? (
              <p className="text-[11px] text-error-500 font-medium">
                {validationError}
              </p>
            ) : (
              <span />
            )}
            <span className={`text-[11px] ${refleksiText.trim().length >= MIN_CHARS ? "text-success-500" : "text-gray-400"}`}>
              {refleksiText.trim().length}/{MIN_CHARS}+
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={refleksiText.trim().length < MIN_CHARS}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
        >
          <PenLine className="size-3.5" />
          Simpan Refleksi
        </button>
      </div>

      {/* Success Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-zoomIn">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 bg-success-100 dark:bg-success-950/30 rounded-full text-success-500 mb-1">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white font-heading">
                Refleksi Berhasil Disimpan!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Selamat, Anda telah menyelesaikan proses pembelajaran. Hasil simulasi
                dan refleksi Anda telah tersimpan pada{" "}
                <strong className="text-gray-700 dark:text-gray-200">Riwayat Simulasi</strong>.
                Silakan perhatikan komentar dan masukan dari guru pada riwayat simulasi Anda.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
