import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Terminal, Key, Image as ImageIcon, Zap, Upload, Wand2, Dices, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { generateEthWallet } from './lib/wallet';
import { generateCoverImage } from './lib/gemini';
import { generateGhostPrompt } from './lib/ghost-prompt';
import { encodeMessage, decodeMessage } from './lib/stego';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [secretData, setSecretData] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'ENCODE' | 'DECODE'>('ENCODE');
  
  const [carrierImage, setCarrierImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Decode states
  const [decodeImage, setDecodeImage] = useState<string | null>(null);
  const [decodePassword, setDecodePassword] = useState('');
  const [decodedData, setDecodedData] = useState('');
  const decodeFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAiPrompt(generateGhostPrompt());
    
    if (!isUnlocked) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsUnlocked(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isUnlocked]);

  const handleEthWalletGen = () => {
    setSecretData(generateEthWallet());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCarrierImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const imgDataUrl = await generateCoverImage(aiPrompt);
      setCarrierImage(imgDataUrl);
    } catch (err: any) {
      console.error(err);
      alert("AI Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEncode = async () => {
    if (!carrierImage || !secretData || !password) {
      alert("Missing required fields (Image, Payload, or Password).");
      return;
    }
    setIsProcessing(true);
    try {
      const stegoImage = await encodeMessage(carrierImage, secretData, password);
      // Trigger download
      const link = document.createElement('a');
      link.href = stegoImage;
      link.download = 'enimage_artifact.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Protocol complete. Artifact downloaded.");
    } catch (err: any) {
      alert("Encoding failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtract = async () => {
    if (!decodeImage || !decodePassword) {
      alert("Missing artifact image or password.");
      return;
    }
    setIsProcessing(true);
    try {
      const data = await decodeMessage(decodeImage, decodePassword);
      setDecodedData(data);
    } catch (err: any) {
      alert("Extraction failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-black text-[#00ff41] font-mono flex flex-col items-center justify-center p-8 relative overflow-hidden selection:bg-[#00ff41] selection:text-black">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        
        <div className="max-w-2xl text-center z-10 w-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">H O G O L Y O   I.N.C.</h1>
          <h2 className="text-xl md:text-2xl mb-8 text-cyan-400 tracking-widest uppercase">ETH cold wallett picture generator</h2>
          
          <div className="bg-black/50 border border-[#00ff41]/30 p-6 rounded-xl text-left mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <h3 className="text-[#00ff41] text-lg mb-4 border-b border-[#00ff41]/30 pb-2 tracking-widest">INITIALIZING ENIMAGE PROTOCOL...</h3>
            <ul className="space-y-4 text-sm md:text-base text-gray-300">
              <li className="flex items-start"><span className="text-[#00ff41] mr-3 mt-1">►</span> <span>Generate or upload a cover image.</span></li>
              <li className="flex items-start"><span className="text-[#00ff41] mr-3 mt-1">►</span> <span>Generate a secure ETH Cold Wallet offline.</span></li>
              <li className="flex items-start"><span className="text-[#00ff41] mr-3 mt-1">►</span> <span>Encrypt the payload with AES-256 using your master key.</span></li>
              <li className="flex items-start"><span className="text-[#00ff41] mr-3 mt-1">►</span> <span>Hide the encrypted data inside the image pixels (Steganography).</span></li>
              <li className="flex items-start"><span className="text-[#00ff41] mr-3 mt-1">►</span> <span>Download the artifact. The truth remains hidden in plain sight.</span></li>
            </ul>
          </div>

          <div className="w-full bg-gray-900 rounded-full h-2 mb-4 overflow-hidden border border-[#00ff41]/20">
            <div className="bg-[#00ff41] h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(0,255,65,0.8)]" style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}></div>
          </div>
          <p className="text-sm text-[#00ff41] animate-pulse tracking-widest">SYSTEM BOOT IN {timeLeft} SECONDS...</p>
          
          <button 
            onClick={() => setIsUnlocked(true)}
            className="mt-8 px-6 py-3 border border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 rounded-xl transition-all text-xs tracking-[0.2em] shadow-[0_0_15px_rgba(0,255,65,0.2)] hover:shadow-[0_0_25px_rgba(0,255,65,0.4)]"
          >
            SKIP BOOT SEQUENCE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white font-mono relative overflow-hidden selection:bg-[#00ff41] selection:text-black bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2000&auto=format&fit=crop')" }} // KÉRLEK CSERÉLD KI EZT A KOPONYÁS KÉP URL-JÉRE VAGY ELÉRÉSI ÚTJÁRA
    >
      
      {/* Vizuális Zaj és CRT Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 z-50 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      <style>{`
        .glitch-text {
          position: relative;
          color: white;
        }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 red;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 blue;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% { clip: rect(21px, 9999px, 86px, 0); }
          20% { clip: rect(4px, 9999px, 12px, 0); }
          40% { clip: rect(98px, 9999px, 64px, 0); }
          60% { clip: rect(34px, 9999px, 93px, 0); }
          80% { clip: rect(62px, 9999px, 21px, 0); }
          100% { clip: rect(10px, 9999px, 44px, 0); }
        }
        @keyframes glitch-anim2 {
          0% { clip: rect(81px, 9999px, 11px, 0); }
          20% { clip: rect(16px, 9999px, 98px, 0); }
          40% { clip: rect(54px, 9999px, 32px, 0); }
          60% { clip: rect(11px, 9999px, 75px, 0); }
          80% { clip: rect(87px, 9999px, 14px, 0); }
          100% { clip: rect(32px, 9999px, 59px, 0); }
        }
      `}</style>

      <div className="max-w-3xl mx-auto p-6 pt-12 relative z-10">
        
        {/* Header */}
        <header className="mb-10 pb-6 flex justify-between items-end border-b border-white/10">
          <div>
            <h1 
              className="text-4xl md:text-5xl font-black tracking-tighter mb-2 glitch-text uppercase drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" 
              data-text="H O G O L Y O   I.N.C."
            >
              H O G O L Y O   I.N.C.
            </h1>
            <p className="text-white/70 text-sm tracking-widest flex items-center uppercase">
              <Terminal className="w-4 h-4 mr-2 text-cyan-400" />
              ETH cold wallett picture generator
            </p>
          </div>
          <ShieldAlert className="w-8 h-8 text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
        </header>

        {/* Tab Controller */}
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setMode('ENCODE')}
            className={`flex-1 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 font-bold tracking-widest ${mode === 'ENCODE' ? 'border-cyan-400/50 bg-cyan-400/20 text-white shadow-[0_0_20px_rgba(0,255,255,0.2)]' : 'border-white/10 bg-black/40 text-white/50 hover:bg-white/10 hover:text-white'}`}
          >
            [ ENCODE_GHOST ]
          </button>
          <button 
            onClick={() => setMode('DECODE')}
            className={`flex-1 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 font-bold tracking-widest ${mode === 'DECODE' ? 'border-cyan-400/50 bg-cyan-400/20 text-white shadow-[0_0_20px_rgba(0,255,255,0.2)]' : 'border-white/10 bg-black/40 text-white/50 hover:bg-white/10 hover:text-white'}`}
          >
            [ EXTRACT_TRUTH ]
          </button>
        </div>

        {/* Glassmorphism Main Card */}
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
          
          {mode === 'ENCODE' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Carrier Selection */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-cyan-400/70 mb-3">1. The Illusion (Carrier Image)</label>
                
                {!carrierImage ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Upload Option */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-white/50 bg-black/40 hover:bg-white/10 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer backdrop-blur-md"
                    >
                      <Upload className="w-8 h-8 mb-3 text-cyan-400/50" />
                      <span className="text-sm tracking-widest text-center">UPLOAD LOCAL DECOY</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                    </div>

                    {/* AI Option */}
                    <div className="border border-dashed border-white/20 rounded-2xl p-5 flex flex-col justify-between bg-black/40 backdrop-blur-md">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-cyan-400/70 tracking-widest">AI GENERATOR</span>
                        <button onClick={() => setAiPrompt(generateGhostPrompt())} className="text-white/50 hover:text-cyan-400 transition-colors">
                          <Dices className="w-4 h-4" />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400/50 focus:bg-black/70 mb-4 font-mono transition-all placeholder:text-white/30"
                        placeholder="Enter prompt..."
                      />
                      <button 
                        onClick={handleGenerateAI}
                        disabled={isGenerating || !aiPrompt}
                        className="w-full py-3 rounded-xl bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/40 hover:text-white transition-all text-xs tracking-widest flex items-center justify-center disabled:opacity-50 font-bold shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                      >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        {isGenerating ? 'GENERATING...' : 'CONJURE DECOY'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border border-white/20 rounded-2xl p-2 bg-black/40 backdrop-blur-md group overflow-hidden">
                    <img src={carrierImage} alt="Carrier" className="w-full max-h-64 object-contain opacity-90 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <button 
                      onClick={() => setCarrierImage(null)}
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs tracking-widest hover:bg-red-500/80 border border-white/20 hover:border-red-500/50 transition-all shadow-lg"
                    >
                      DISCARD
                    </button>
                  </div>
                )}
              </div>

              {/* Payload & Wallet Generator */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-xs uppercase tracking-widest text-cyan-400/70">2. The Truth (Encrypted Payload)</label>
                  <button 
                    onClick={handleEthWalletGen}
                    className="text-xs bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 rounded-xl px-4 py-2 hover:bg-cyan-400/30 hover:text-white transition-all flex items-center font-bold tracking-wider backdrop-blur-sm"
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    GENERATE ETH COLD WALLET
                  </button>
                </div>
                <textarea 
                  value={secretData}
                  onChange={(e) => setSecretData(e.target.value)}
                  placeholder="Paste your secrets here, or click Generate ETH Cold Wallet..."
                  className="w-full h-40 bg-black/50 border border-white/20 rounded-2xl p-5 text-cyan-300 focus:outline-none focus:border-cyan-400/50 focus:bg-black/70 focus:shadow-[0_0_20px_rgba(0,255,255,0.1)] resize-none transition-all placeholder:text-white/30 backdrop-blur-md leading-relaxed"
                />
              </div>

              {/* Encryption Key */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-cyan-400/70 mb-3">3. Master Key (AES-256-GCM)</label>
                <div className="relative">
                  <Key className="absolute left-4 top-4 w-5 h-5 text-cyan-400/50" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ENTER STRONG PASSWORD..."
                    className="w-full bg-black/50 border border-white/20 rounded-2xl pl-12 pr-12 py-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-black/70 focus:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all placeholder:text-white/30 tracking-widest backdrop-blur-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-cyan-400/50 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleEncode}
                disabled={isProcessing || !carrierImage || !secretData || !password}
                className="w-full mt-6 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-2xl font-bold tracking-widest py-5 hover:bg-cyan-400/40 hover:text-white transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-lg disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null}
                {isProcessing ? 'ENCODING...' : 'INITIATE SCATTER PROTOCOL'}
              </button>
            </div>
          )}

          {mode === 'DECODE' && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-6">
                <ShieldAlert className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-80 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
                <h2 className="text-2xl uppercase tracking-widest text-white mb-2 font-bold">Decrypt the Decoy</h2>
                <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">Upload an Enimage artifact and provide the AES master key to extract the hidden payload.</p>
              </div>

              {/* Artifact Upload */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-cyan-400/70 mb-3">1. The Artifact (Stego Image)</label>
                {!decodeImage ? (
                  <div 
                    onClick={() => decodeFileInputRef.current?.click()}
                    className="border border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-white/50 bg-black/40 hover:bg-white/10 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer backdrop-blur-md"
                  >
                    <Upload className="w-10 h-10 mb-4 text-cyan-400/50" />
                    <span className="text-sm tracking-widest text-center">UPLOAD ARTIFACT (.PNG)</span>
                    <input 
                      type="file" 
                      accept="image/png" 
                      className="hidden" 
                      ref={decodeFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => setDecodeImage(event.target?.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative border border-white/20 rounded-2xl p-2 bg-black/40 backdrop-blur-md group overflow-hidden">
                    <img src={decodeImage} alt="Artifact" className="w-full max-h-64 object-contain opacity-90 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <button 
                      onClick={() => { setDecodeImage(null); setDecodedData(''); }}
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs tracking-widest hover:bg-red-500/80 border border-white/20 hover:border-red-500/50 transition-all shadow-lg"
                    >
                      DISCARD
                    </button>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-cyan-400/70 mb-3">2. Master Key</label>
                <div className="relative">
                  <Key className="absolute left-4 top-4 w-5 h-5 text-cyan-400/50" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={decodePassword}
                    onChange={(e) => setDecodePassword(e.target.value)}
                    placeholder="ENTER DECRYPTION KEY..."
                    className="w-full bg-black/50 border border-white/20 rounded-2xl pl-12 pr-12 py-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-black/70 focus:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all placeholder:text-white/30 tracking-widest backdrop-blur-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-cyan-400/50 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Extract Button */}
              <button 
                onClick={handleExtract}
                disabled={isProcessing || !decodeImage || !decodePassword}
                className="w-full bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-2xl font-bold tracking-widest py-5 hover:bg-cyan-400/40 hover:text-white transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-lg disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null}
                {isProcessing ? 'EXTRACTING...' : 'EXTRACT TRUTH'}
              </button>

              {/* Result */}
              {decodedData && (
                <div className="mt-8 animate-fade-in">
                  <label className="block text-xs uppercase tracking-widest text-green-400/70 mb-3">Extracted Payload</label>
                  <textarea 
                    readOnly
                    value={decodedData}
                    className="w-full h-40 bg-black/50 border border-green-400/30 rounded-2xl p-5 text-green-300 focus:outline-none resize-none backdrop-blur-md leading-relaxed shadow-[0_0_20px_rgba(0,255,0,0.1)]"
                  />
                </div>
              )}
            </div>
          )}

        </div>

        <footer className="mt-10 text-center text-[10px] text-white/40 uppercase tracking-[0.3em] drop-shadow-md">
          <p>H O G O L Y O   I.N.C. © 2026 | Data is the only currency.</p>
        </footer>
      </div>
    </div>
  );
}

