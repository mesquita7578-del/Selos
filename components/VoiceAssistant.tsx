
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface VoiceAssistantProps {
  collectionSummary: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ collectionSummary }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const outCtx = new AudioContext({ sampleRate: 24000 });
      let nextStartTime = 0;
      const sources = new Set<AudioBufferSourceNode>();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `Você é um curador filatélico sênior. O usuário tem um arquivo com: ${collectionSummary}. Seja amigável, técnico e ajude a identificar raridades.`
        },
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
            setIsConnecting(false);
            setIsActive(true);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const bytes = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
              const dataInt16 = new Int16Array(bytes.buffer);
              const buffer = outCtx.createBuffer(1, dataInt16.length, 24000);
              const channelData = buffer.getChannelData(0);
              for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768;
              
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              nextStartTime = Math.max(nextStartTime, outCtx.currentTime);
              source.start(nextStartTime);
              nextStartTime += buffer.duration;
              sources.add(source);
            }
            if (msg.serverContent?.interrupted) {
              sources.forEach(s => s.stop());
              sources.clear();
              nextStartTime = 0;
            }
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    audioContextRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {isActive && (
        <div className="bg-slate-900 border border-cyan-500/50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Curador por Voz Ativo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">"Gemini, me conte sobre minha coleção da Europa..."</p>
        </div>
      )}
      
      <button 
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${isActive ? 'bg-red-500 neon-glow' : 'bg-cyan-500 neon-glow hover:scale-110'}`}
      >
        {isConnecting ? (
          <div className="w-8 h-8 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
        ) : isActive ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <div className="w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" /><path d="M10 18a8 8 0 008-8h-2a6 6 0 01-12 0H2a8 8 0 008 8z" /></svg>
            </div>
            <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-ping"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
