import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  Database
} from 'lucide-react';
import {
  downloadSampleCSV,
  exportTransactionsCSV,
  importTransactionsCSV,
  CSVImportResult,
} from '../services/api';

export const ReportsPage: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDownloadSample = async () => {
    try {
      await downloadSampleCSV();
    } catch (err) {
      alert('Failed to download sample CSV template.');
    }
  };

  const handleExportCSV = async () => {
    try {
      setDownloading(true);
      await exportTransactionsCSV();
    } catch (err) {
      alert('Failed to export transactions. Ensure you are logged in and have recorded transactions.');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid format. Please select a .csv file.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setImportResult(null);

      const res = await importTransactionsCSV(file);
      setImportResult(res);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to process CSV file.');
    } finally {
      setUploading(false);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Reports & Statement Import</h2>
        <p className="text-xs text-slate-400">
          Bulk import statements via CSV, detect duplicates, and export financial audit archives
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* CSV Upload Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-brand-400 mb-2">
              <Upload className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Import Transactions (CSV)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Upload bank statements or transaction exports. FinWise AI validates rows, flags duplicate records, and auto-infers categories using Machine Learning.
            </p>

            {/* Dropzone */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/50 p-8 text-center hover:border-brand-500/60 transition-colors">
              <input
                type="file"
                accept=".csv"
                disabled={uploading}
                onChange={handleFileUpload}
                className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 mb-3">
                {uploading ? (
                  <RefreshCw className="h-6 w-6 animate-spin text-brand-400" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6" />
                )}
              </div>
              <p className="text-xs font-semibold text-white">
                {uploading ? 'Parsing & validating statement...' : 'Click or drag a .csv file here'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Expected columns: Date, Description, Amount, Type, Category
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
            <span className="text-[11px] text-slate-400">Need the correct column format?</span>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>
        </div>

        {/* CSV Export & Audit Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
              <Download className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Export Financial Ledger (CSV)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Export all your recorded transactions including category classifications, outlier scores, and anomaly verification status into a standard spreadsheet file.
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>File Format:</span>
                <strong className="text-white">Comma-Separated Values (.csv)</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Data Isolation:</span>
                <span className="text-emerald-400 font-semibold">Strictly Authenticated User Scope</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Included Metadata:</span>
                <span className="text-slate-400">Amount, Date, Type, Anomaly Flag</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className={`h-4 w-4 ${downloading ? 'animate-spin' : ''}`} />
            <span>{downloading ? 'Preparing Archive...' : 'Export Complete Ledger (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Upload Telemetry Status Banner */}
      {uploadError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {importResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 mb-3">
            <CheckCircle className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Statement Processing Report
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 mb-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-[11px] text-slate-400">Rows Evaluated</p>
              <p className="text-lg font-bold text-white mt-0.5">{importResult.total_rows_evaluated}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-[11px] text-slate-400">Imported Successfully</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{importResult.imported_count}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-[11px] text-slate-400">Duplicates Skipped</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{importResult.duplicates_skipped}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-[11px] text-slate-400">Format Errors</p>
              <p className="text-lg font-bold text-slate-300 mt-0.5">{importResult.errors_count}</p>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <p className="font-semibold mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Notice on skipped rows:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
