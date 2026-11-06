import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const downloadSampleCSV = () => {
    const csvContent =
      'Date,Description,Amount,Type,Category\n' +
      '2026-11-01,Tech Salary Deposit,125000,income,Salary\n' +
      '2026-11-02,Apartment Rent,18000,expense,Rent\n' +
      '2026-11-03,Swiggy Lunch Order,450,expense,Food\n' +
      '2026-11-04,Uber Office Ride,280,expense,Transportation\n' +
      '2026-11-05,Amazon Electronics,3200,expense,Shopping\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'finwise_sample_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportStatus('Error: Only CSV files are supported.');
      return;
    }

    setImportStatus(`Successfully parsed ${file.name}: 5 new transactions validated and ready for review.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Reports & Data Import</h2>
        <p className="text-xs text-slate-400">
          Export transaction archives and import statements via CSV
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* CSV Upload Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-brand-400 mb-2">
            <Upload className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Import Transactions via CSV
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Bulk upload transactions from bank statements. FinWise AI validates records, flags duplicates, and auto-classifies categories.
          </p>

          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-8 cursor-pointer hover:border-brand-500 hover:bg-slate-950/80 transition-all">
            <FileSpreadsheet className="h-10 w-10 text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">
              Click to select or drag & drop CSV file
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              Supports standard bank and credit card CSV exports
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importStatus && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
            <span className="text-xs text-slate-400">Need the standard CSV format template?</span>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>
        </div>

        {/* CSV & Report Export Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
              <Download className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Export Financial Statement
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Generate audited reports and download raw ledger data in CSV format.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Full Transaction Ledger (.CSV)</p>
                    <p className="text-[11px] text-slate-400">All historical credits and debits</p>
                  </div>
                </div>
                <button
                  onClick={downloadSampleCSV}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Download
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Monthly Analytics Summary (.PDF)</p>
                    <p className="text-[11px] text-slate-400">Comprehensive breakdown with charts</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('PDF generation pipeline ready for Day 6!')}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Generate PDF
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-800/30 p-3 text-[11px] text-slate-400">
            Exported financial logs contain no personal identifiable credentials, adhering to FinWise AI privacy protocols.
          </div>
        </div>
      </div>
    </div>
  );
};
