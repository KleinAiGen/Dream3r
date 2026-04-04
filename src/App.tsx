import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Terminal, Key, Image as ImageIcon, Zap, Upload, Wand2, Dices, RefreshCw } from 'lucide-react';
import { generateEthWallet } from './lib/wallet';
import { generateCoverImage } from './lib/gemini';
import { generateGhostPrompt } from './lib/ghost-prompt';

export default function App() {
  const [secretData, setSecretData] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'ENCODE' | 'DECODE'>('ENCODE');
  
  const [carrierImage, setCarrierImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAiPrompt(generateGhostPrompt());
  }, []);

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
              className="text-5xl font-black tracking-tighter mb-2 glitch-text uppercase drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" 
              data-text="DREAM3R"
            >
              DREAM3R
            </h1>
            <p className="text-white/70 text-sm tracking-widest flex items-center">
              <Terminal className="w-4 h-4 mr-2 text-cyan-400" />
              fsociety steganography protocol
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
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ENTER STRONG PASSWORD..."
                    className="w-full bg-black/50 border border-white/20 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-black/70 focus:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all placeholder:text-white/30 tracking-widest backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-6 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-2xl font-bold tracking-widest py-5 hover:bg-cyan-400/40 hover:text-white transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-lg">
                INITIATE SCATTER PROTOCOL
              </button>
            </div>
          )}

          {mode === 'DECODE' && (
            <div className="space-y-6 text-center py-12 animate-fade-in">
              <ShieldAlert className="w-20 h-20 text-cyan-400 mx-auto mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
              <h2 className="text-2xl uppercase tracking-widest text-white mb-3 font-bold">Decrypt the Decoy</h2>
              <p className="text-white/60 text-sm mb-10 max-w-md mx-auto leading-relaxed">Upload a Dream3r artifact and provide the AES master key to extract the hidden payload.</p>
              
              <button className="px-10 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-2xl font-bold tracking-widest py-5 hover:bg-cyan-400/40 hover:text-white transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-lg">
                UPLOAD & EXTRACT
              </button>
            </div>
          )}

        </div>

        <footer className="mt-10 text-center text-[10px] text-white/40 uppercase tracking-[0.3em] drop-shadow-md">
          <p>Control is an illusion. Data is the only currency.</p>
        </footer>
      </div>
    </div>
  );
}

