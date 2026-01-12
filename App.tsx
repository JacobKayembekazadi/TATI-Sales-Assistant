
import React, { useState, useEffect, useRef } from 'react';
import { analyzeInquiry } from './services/geminiService';
import { AnalysisResult, AppStatus, FileData } from './types';
import { COMPANY_INFO, LOADING_MESSAGES } from './constants';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [inquiry, setInquiry] = useState('');
  const [attachedFile, setAttachedFile] = useState<FileData | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (status === AppStatus.LOADING) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF or Word document (.doc, .docx).");
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      setAttachedFile({
        base64,
        mimeType: file.type,
        name: file.name
      });
      setError(null);
    } catch (err) {
      setError("Failed to process the file.");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileChange(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!inquiry.trim() && !attachedFile) return;
    
    setStatus(AppStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeInquiry(inquiry, attachedFile || undefined);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
      
      // Smooth scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setInquiry('');
    setAttachedFile(null);
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-oil-well text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">TATI Sales Assistant</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Texas American Trade Inc.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Houston</span>
            <span>Mexico</span>
            <span>Latin America</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Input */}
          <div className={`${result ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-6 transition-all duration-500`}>
            <div 
              className={`bg-white rounded-2xl border-2 transition-all duration-300 p-6 ${isDragging ? 'border-blue-500 border-dashed bg-blue-50/50 shadow-inner' : 'border-slate-200 shadow-sm'}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-message text-blue-600"></i>
                  Customer Inquiry
                </h2>
                {result && (
                  <button 
                    onClick={handleReset}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <i className="fa-solid fa-rotate-right"></i>
                    New Analysis
                  </button>
                )}
              </div>
              
              <div className="relative group">
                <textarea
                  className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400"
                  placeholder="Paste customer email or message here, or drag & drop a PDF/Word file..."
                  value={inquiry}
                  onChange={(e) => setInquiry(e.target.value)}
                  disabled={status === AppStatus.LOADING}
                />
                
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center rounded-xl pointer-events-none">
                    <div className="bg-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
                      <i className="fa-solid fa-file-arrow-up text-blue-600 text-xl"></i>
                      <span className="font-bold text-blue-600">Drop file to attach</span>
                    </div>
                  </div>
                )}
              </div>

              {/* File Chip */}
              {attachedFile && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between group animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center flex-shrink-0">
                      <i className={`fa-solid ${attachedFile.mimeType.includes('pdf') ? 'fa-file-pdf' : 'fa-file-word'}`}></i>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-blue-900 truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-blue-500 uppercase font-bold tracking-tight">Ready to analyze</p>
                    </div>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
              
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                />
                <button
                  onClick={triggerFileInput}
                  disabled={status === AppStatus.LOADING}
                  className="bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200"
                >
                  <i className="fa-solid fa-paperclip"></i>
                  {attachedFile ? 'Change File' : 'Attach File'}
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={status === AppStatus.LOADING || (!inquiry.trim() && !attachedFile)}
                  className="flex-grow bg-blue-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {status === AppStatus.LOADING ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-magnifying-glass-chart"></i>
                      Analyze Inquiry
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700">
                  <i className="fa-solid fa-circle-exclamation mt-1"></i>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Quick Guide */}
            {!result && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <i className="fa-solid fa-paste text-blue-600 mb-2"></i>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Step 1</h4>
                  <p className="text-sm text-slate-700">Paste raw inquiry or drag a PDF/Word document.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <i className="fa-solid fa-bolt text-yellow-500 mb-2"></i>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Step 2</h4>
                  <p className="text-sm text-slate-700">AI identifies the right chemical solution instantly.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <i className="fa-solid fa-paper-plane text-green-600 mb-2"></i>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Step 3</h4>
                  <p className="text-sm text-slate-700">Copy the professional response & send.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Results */}
          <div className={`${result ? 'lg:col-span-7' : 'hidden'} min-h-[600px]`}>
            {status === AppStatus.LOADING ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-900 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-flask-vial text-blue-900/20 text-2xl"></i>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-slate-800 text-lg">Sales Assistant is Thinking</p>
                  <p className="text-slate-500 animate-pulse text-sm font-medium">{LOADING_MESSAGES[loadingMsgIdx]}</p>
                </div>
              </div>
            ) : result ? (
              <div ref={resultRef}>
                <AnalysisDisplay result={result} />
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-800 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white">
                  <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <span className="font-bold text-white text-lg">{COMPANY_INFO.name}</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Serving the global oil and gas industry with high-performance chemistry and technical expertise across the Americas.
              </p>
            </div>
            <div className="flex flex-col md:items-end justify-center space-y-2 text-sm">
              <p className="flex items-center gap-2"><i className="fa-solid fa-location-dot"></i> {COMPANY_INFO.address}</p>
              <p className="flex items-center gap-2"><i className="fa-solid fa-globe"></i> {COMPANY_INFO.website}</p>
              <p className="flex items-center gap-2"><i className="fa-solid fa-phone"></i> {COMPANY_INFO.phone}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} TATI INTERNAL TOOLS</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Safety Data Sheets</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
