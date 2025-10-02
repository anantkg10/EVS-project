
import React, { useState, useRef, useCallback } from 'react';
import { analyzePlantImage } from '../services/geminiService';
import { ScanResult, Severity, HistoryItem } from '../types';
import HolographicButton from '../components/HolographicButton';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import Gauge from '../components/Gauge';

const ScanView: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScanResult(null);
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !imagePreview) return;
    setIsLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const result = await analyzePlantImage(imageFile);
      setScanResult(result);

      // Save to history
      const newHistoryItem: HistoryItem = {
          ...result,
          id: new Date().toISOString(),
          date: new Date().toISOString(),
          imagePreview: imagePreview,
      };
      const existingHistory: HistoryItem[] = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      const updatedHistory = [newHistoryItem, ...existingHistory].slice(0, 50); // Keep last 50 scans
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const getSeverityIcon = (severity: Severity) => {
    switch(severity) {
        case Severity.HEALTHY: return <Icon name="healthy" className="w-6 h-6 text-green-400" />;
        case Severity.MILD: return <Icon name="warning" className="w-6 h-6 text-yellow-400" />;
        case Severity.MODERATE: return <Icon name="warning" className="w-6 h-6 text-orange-400" />;
        case Severity.SEVERE: return <Icon name="warning" className="w-6 h-6 text-red-500" />;
        default: return null;
    }
  }

  const getTreatmentIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('spray') || lowerName.includes('fungicide')) return <Icon name="spray" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('fertilize') || lowerName.includes('nutrient')) return <Icon name="fertilizer" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('prun') || lowerName.includes('remove')) return <Icon name="scissors" className="w-8 h-8 text-green-300" />;
    return <Icon name="leaf" className="w-8 h-8 text-green-300" />;
  }

  const getPreventionIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rotat')) return <Icon name="rotate" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('variety') || lowerName.includes('resistant')) return <Icon name="shield" className="w-8 h-8 text-green-300" />;
    if (lowerName.includes('irrigat') || lowerName.includes('water')) return <Icon name="water" className="w-8 h-8 text-green-300" />;
    return <Icon name="leaf" className="w-8 h-8 text-green-300" />;
  }


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <LoadingSpinner text="ANALYZING IMAGE..." />
        {imagePreview && <img src={imagePreview} alt="Scanning plant" className="mt-8 rounded-lg max-w-sm w-full h-auto object-cover opacity-30" />}
      </div>
    );
  }

  if (scanResult) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-center mb-8 text-green-300">Analysis Complete</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <img src={imagePreview!} alt="Analyzed plant" className="rounded-lg w-full h-auto object-cover mb-4" />
                    <HolographicButton onClick={resetState} className="w-full">Scan Another Plant</HolographicButton>
                </div>
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border text-center">
                    <h3 className="text-xl font-bold text-green-300 mb-4">Severity Assessment</h3>
                    <div className="flex justify-center">
                        <Gauge severity={scanResult.severity} />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-bold text-green-300">{scanResult.diseaseName}</h3>
                            <p className="text-gray-400">Confidence: {scanResult.confidence.toFixed(1)}%</p>
                        </div>
                        {getSeverityIcon(scanResult.severity)}
                    </div>
                    <p className="mt-4 text-gray-300">{scanResult.summary}</p>
                </div>

                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <h3 className="text-2xl font-bold text-green-300 mb-4">Treatment Recommendations</h3>
                    <div className="space-y-4">
                        {scanResult.treatments.map((item, index) => (
                            <div key={index} className="flex items-start space-x-4">
                                <div className="p-3 bg-green-500/10 rounded-full">{getTreatmentIcon(item.name)}</div>
                                <div>
                                    <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border">
                    <h3 className="text-2xl font-bold text-green-300 mb-4">Prevention Tips</h3>
                     <div className="space-y-4">
                        {scanResult.preventionTips.map((item, index) => (
                           <div key={index} className="flex items-start space-x-4">
                                <div className="p-3 bg-green-500/10 rounded-full">{getPreventionIcon(item.name)}</div>
                                <div>
                                    <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <h2 className="text-4xl font-bold mb-4 text-green-300">Upload Plant Image</h2>
      <p className="text-gray-400 mb-8 max-w-lg">Choose a clear photo of the affected plant part (leaf, stem, or fruit) for the most accurate diagnosis.</p>

      <div
        className="w-full max-w-2xl h-80 border-2 border-dashed border-green-400/50 rounded-2xl flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-sm cursor-pointer hover:border-green-400 hover:bg-black/40 transition-all duration-300"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
        {imagePreview ? (
          <img src={imagePreview} alt="Plant preview" className="max-h-full rounded-lg" />
        ) : (
          <div className="text-center">
            <Icon name="upload" className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-xl font-semibold">Drag & Drop or Click to Upload</p>
            <p className="text-gray-500">PNG, JPG, or WEBP supported</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 mt-4">{error}</p>}
      
      {imageFile && (
        <HolographicButton
            onClick={handleAnalyze}
            disabled={isLoading}
            className="mt-8 animate-glowing"
        >
            Analyze Plant
        </HolographicButton>
      )}
    </div>
  );
};

export default ScanView;
