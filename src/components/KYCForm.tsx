import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

interface KYCFormProps {
  onSuccess?: () => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_MB = 10;

const KYCForm: React.FC<KYCFormProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [docType, setDocType] = useState<'id' | 'passport' | 'residency'>('id');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File) => {
    setError(null);
    
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, or PDF.');
      return false;
    }
    
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    
    // Simulate API call
    // TODO: Wire to backend KYC endpoint when implemented.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus('success');
    if (onSuccess) setTimeout(onSuccess, 1500);
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Submission Received</h3>
        <p className="text-gray-500 mb-8">Our compliance team is reviewing your documents. This usually takes 2-4 hours.</p>
        <button 
          onClick={resetForm}
          className="text-sm font-bold text-indigo-600 hover:underline"
        >
          Upload another document
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-1">Verify Identity</h3>
          <p className="text-sm text-gray-500">Please provide a clear scan of your identification.</p>
        </div>

        {/* Document Type Selector */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'id', label: 'National ID' },
            { id: 'passport', label: 'Passport' },
            { id: 'residency', label: 'Residency' }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setDocType(type.id as any)}
              className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                docType === type.id 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Upload Area */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            file ? 'bg-indigo-50/30 border-indigo-200' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div 
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-500">
                  <FileCheck className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-900 mb-1">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 p-2 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-gray-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-900 mb-1">Click or drag to upload</p>
                <p className="text-xs text-gray-500 px-8">PDF, JPG or PNG. Maximum file size 10MB.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold">{error}</p>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!file || status === 'uploading'}
          className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl shadow-gray-200"
        >
          {status === 'uploading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Submit for Verification
              <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-gray-400 mt-0.5" />
          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider font-bold">
            All documents are encrypted and stored securely following Bank of Algeria data protection standards.
          </p>
        </div>
      </form>
    </div>
  );
};

export default KYCForm;
