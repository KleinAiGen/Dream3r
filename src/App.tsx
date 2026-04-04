import { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Image as ImageIcon, Upload, Download, Wand2, Shield, AlertTriangle, CheckCircle2, Wallet, Dices, Skull } from 'lucide-react';
import { encryptText, decryptText } from './lib/crypto';
import { encodeImage, decodeImage } from './lib/stego';
import { generateCoverImage } from './lib/gemini';
import { createColdStoragePayload } from './lib/wallet';
import { generateGhostPrompt } from './lib/ghost-prompt';

type Tab = 'encode' | 'decode';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('encode');
  
  // Encode State
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [secretText, setSecretText] = useState('');
  const [encodePassword, setEncodePassword] = useState('');
  const [encodedImage, setEncodedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEncoding, setIsEncoding] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  useEffect(() => {
    setAiPrompt(generateGhostPrompt());
  }, []);
  
  // Decode State
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [decodePassword, setDecodePassword] = useState('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  
  // Global State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const decodeFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target?.result as string);
      setError(null);
      setSuccess(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      const imgDataUrl = await generateCoverImage(aiPrompt);
      setCoverImage(imgDataUrl);
      setSuccess("AI Cover image generated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEncode = async () => {
    if (!coverImage || !secretText || !encodePassword) {
      setError("Please provide a cover image, secret text, and password.");
      return;
    }
    
    setIsEncoding(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 1. Encrypt text with AES-256-GCM
      const encryptedPayload = await encryptText(secretText, encodePassword);
      
      // 2. Hide encrypted payload in image via LSB with Scatter Protocol
      const resultImage = await encodeImage(coverImage, encryptedPayload, encodePassword);
      
      setEncodedImage(resultImage);
      setSuccess("Secret successfully encrypted and hidden in the image using Scatter Protocol.");
    } catch (err: any) {
      setError(err.message || "Encoding failed.");
    } finally {
      setIsEncoding(false);
    }
  };

  const handleDecode = async () => {
    if (!stegoImage || !decodePassword) {
      setError("Please provide the steganographic image and password.");
      return;
    }
    
    setIsDecoding(true);
    setError(null);
    setSuccess(null);
    setDecryptedText(null);
    
    try {
      // 1. Extract hidden payload from image via LSB with Scatter Protocol
      const extractedPayload = await decodeImage(stegoImage, decodePassword);
      
      // 2. Decrypt payload with AES-256-GCM
      const text = await decryptText(extractedPayload, decodePassword);
      
      setDecryptedText(text);
      setSuccess("Secret successfully extracted and decrypted.");
    } catch (err: any) {
      setError(err.message || "Decoding failed. Incorrect password or invalid image.");
    } finally {
      setIsDecoding(false);
    }
  };

  const downloadImage = () => {
    if (!encodedImage) return;
    const a = document.createElement('a');
    a.href = encodedImage;
    a.download = 'secure_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePanic = () => {
    setCoverImage(null);
    setSecretText('');
    setEncodePassword('');
    setEncodedImage(null);
    setStegoImage(null);
    setDecodePassword('');
    setDecryptedText(null);
    setError(null);
    setSuccess(null);
    setAiPrompt(generateGhostPrompt());
  };

  const currentBgImage = activeTab === 'encode' ? coverImage : stegoImage;

  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Dynamic Image Background */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          opacity: currentBgImage ? 0.4 : 0,
          backgroundImage: currentBgImage ? `url(${currentBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px)',
          transform: 'scale(1.2)'
        }}
      />

      {/* Fallback Background Glows */}
      <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none transition-opacity duration-1000 z-0 ${currentBgImage ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none transition-opacity duration-1000 z-0 ${currentBgImage ? 'opacity-0' : 'opacity-100'}`} />

      {/* Panic Button */}
      <button 
        onClick={handlePanic}
        className="absolute top-4 right-4 md:top-6 md:right-6 px-3 py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-500 hover:text-red-400 rounded-lg text-xs font-bold tracking-widest transition-all flex items-center shadow-lg shadow-red-900/20 z-50 backdrop-blur-md"
        title="Instantly wipe all memory and inputs"
      >
        <Skull className="w-4 h-4 mr-2" />
        PANIC WIPE
      </button>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        
        {/* Header */}
        <header className="mb-12 text-center pt-8 relative z-10">
          <div className="inline-flex items-center justify-center p-4 bg-black/5 backdrop-blur-3xl border border-white/5 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            {/* Icon placeholder - replace src with the public URL of the uploaded image */}
            <img 
              src="https://picsum.photos/seed/dream3r/100/100" 
              alt="Dream3r Icon" 
              className="w-16 h-16 rounded-xl object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tighter mb-4 drop-shadow-lg">DREAM3R <span className="text-emerald-500 font-light">VAULT</span></h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-base font-light tracking-wide">
            Zero-Knowledge Architecture. Client-side AES-256-GCM encryption combined with anti-forensic Scatter Protocol steganography.
          </p>
        </header>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start text-red-400">
            <AlertTriangle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start text-emerald-400">
            <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-black/5 backdrop-blur-3xl p-1 rounded-xl mb-8 border border-white/5 shadow-lg relative z-10">
          <button
            onClick={() => { setActiveTab('encode'); setError(null); setSuccess(null); }}
            className={`flex-1 flex items-center justify-center py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === 'encode' 
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
            }`}
          >
            <Lock className="w-4 h-4 mr-2" />
            Encode & Hide
          </button>
          <button
            onClick={() => { setActiveTab('decode'); setError(null); setSuccess(null); }}
            className={`flex-1 flex items-center justify-center py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === 'decode' 
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
            }`}
          >
            <Unlock className="w-4 h-4 mr-2" />
            Extract & Decrypt
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-black/5 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative z-10">
          
          {activeTab === 'encode' ? (
            <div className="space-y-8">
              {/* Step 1: Cover Image */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-xs mr-3 border border-neutral-700">1</span>
                  Cover Image
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Upload Option */}
                  <div className="border border-white/10 rounded-2xl p-5 bg-black/40 backdrop-blur-sm hover:border-white/20 transition-colors">
                    <h3 className="text-sm font-medium text-neutral-400 mb-3">Option A: Upload Image</h3>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => handleImageUpload(e, setCoverImage)}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 border border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl text-sm transition-all flex items-center justify-center text-neutral-400 hover:text-emerald-400"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select Local Image
                    </button>
                  </div>

                  {/* Generate Option */}
                  <div className="border border-white/10 rounded-2xl p-5 bg-black/40 backdrop-blur-sm hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-neutral-400">Option B: AI Generation</h3>
                      {/* A Kliensoldali Generátor Gomb */}
                      <button 
                        onClick={() => setAiPrompt(generateGhostPrompt())}
                        className="text-xs flex items-center text-emerald-500 hover:text-emerald-400 transition-colors"
                        title="Generate local prompt offline"
                      >
                        <Dices className="w-3 h-3 mr-1" />
                        Randomize
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={aiPrompt} 
                        onChange={(e) => setAiPrompt(e.target.value)} 
                        placeholder="Click Randomize or type..." 
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-xs text-neutral-300"
                      />
                      <button 
                        onClick={handleGenerateAI} 
                        disabled={isGenerating || !aiPrompt} 
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      >
                        {isGenerating ? (
                          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover Image Preview */}
                {coverImage && (
                  <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden bg-black/50 flex justify-center backdrop-blur-md p-2">
                    <img src={coverImage} alt="Cover" className="max-h-64 object-contain rounded-xl" />
                  </div>
                )}
              </div>

              {/* Step 2: Secret & Password */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs mr-3 border border-white/20">2</span>
                      Secret Data
                    </h2>
                    
                    {/* A HACK: A Cold Storage Generátor Gomb */}
                    <button 
                      onClick={() => setSecretText(createColdStoragePayload())}
                      className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    >
                      <Wallet className="w-3 h-3 mr-1.5" />
                      Generate Cold Wallet
                    </button>
                  </div>
                  
                  <textarea 
                    value={secretText}
                    onChange={(e) => setSecretText(e.target.value)}
                    placeholder="Enter the highly sensitive data you want to hide..."
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none font-mono text-emerald-400 placeholder:text-neutral-600"
                  />
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs mr-3 border border-white/20">3</span>
                    Encryption Key
                  </h2>
                  <input 
                    type="password" 
                    value={encodePassword}
                    onChange={(e) => setEncodePassword(e.target.value)}
                    placeholder="Strong password for AES-256-GCM..."
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all mb-6 font-mono placeholder:text-neutral-600"
                  />
                  
                  <button 
                    onClick={handleEncode}
                    disabled={isEncoding || !coverImage || !secretText || !encodePassword}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  >
                    {isEncoding ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-3" />
                        Encrypting & Embedding...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Encrypt & Hide
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 4: Result */}
              {encodedImage && (
                <div className="pt-6 border-t border-white/10">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs mr-3 border border-emerald-500/30">4</span>
                    Secure Artifact Ready
                  </h2>
                  <div className="flex flex-col md:flex-row gap-6 items-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <img src={encodedImage} alt="Encoded" className="w-48 h-48 object-cover rounded-xl border border-white/10 shadow-lg" />
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-sm text-neutral-400 mb-4 font-light">
                        This PNG image looks identical to the original, but contains your AES-256-GCM encrypted payload hidden within its least significant bits using the Scatter Protocol.
                      </p>
                      <button 
                        onClick={downloadImage}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center mx-auto md:mx-0 border border-white/10 backdrop-blur-md"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Secure PNG
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Decode Step 1: Upload */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs mr-3 border border-white/20">1</span>
                  Select Secure Artifact
                </h2>
                
                <input 
                  type="file" 
                  accept="image/png" 
                  className="hidden" 
                  ref={decodeFileInputRef}
                  onChange={(e) => handleImageUpload(e, setStegoImage)}
                />
                
                {!stegoImage ? (
                  <button 
                    onClick={() => decodeFileInputRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-2xl transition-all flex flex-col items-center justify-center text-neutral-500 hover:text-emerald-400 group bg-black/20"
                  >
                    <ImageIcon className="w-10 h-10 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="font-medium">Click to upload PNG image</span>
                    <span className="text-xs mt-2 opacity-70">Must be the exact PNG file downloaded previously</span>
                  </button>
                ) : (
                  <div className="relative inline-block">
                    <img src={stegoImage} alt="To Decode" className="max-h-64 rounded-2xl border border-white/10 shadow-lg" />
                    <button 
                      onClick={() => setStegoImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-neutral-400 hover:text-white border border-white/10 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Decode Step 2: Password */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs mr-3 border border-white/20">2</span>
                  Decryption Key
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="password" 
                    value={decodePassword}
                    onChange={(e) => setDecodePassword(e.target.value)}
                    placeholder="Enter the AES-256-GCM password..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono placeholder:text-neutral-600"
                  />
                  <button 
                    onClick={handleDecode}
                    disabled={isDecoding || !stegoImage || !decodePassword}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] whitespace-nowrap"
                  >
                    {isDecoding ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Extract & Decrypt
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Decode Result */}
              {decryptedText && (
                <div className="pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    <Shield className="w-5 h-5 mr-2" />
                    Decrypted Payload
                  </h2>
                  <div className="bg-black/60 border border-emerald-500/30 rounded-2xl p-6 relative group backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <pre className="whitespace-pre-wrap text-sm text-emerald-400 font-mono">
                      {decryptedText}
                    </pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText(decryptedText)}
                      className="absolute top-4 right-4 text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-center text-xs text-neutral-600 font-mono tracking-widest">
          <p>DREAM3R • ZERO-KNOWLEDGE ARCHITECTURE • SCATTER PROTOCOL</p>
        </footer>
      </div>
    </div>
  );
}

