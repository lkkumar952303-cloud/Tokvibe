import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Check, Trash2, Volume2, RotateCcw, Play, Pause } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface VoiceoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  onSaveVoiceover: (audioUrl: string | null, musicVol: number, voiceVol: number) => void;
  initialVoiceoverUrl: string | null;
  initialMusicVolume?: number;
  initialVoiceVolume?: number;
}

export const VoiceoverModal: React.FC<VoiceoverModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  onSaveVoiceover,
  initialVoiceoverUrl,
  initialMusicVolume = 40,
  initialVoiceVolume = 100,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(initialVoiceoverUrl);
  const [recordProgress, setRecordProgress] = useState(0); // 0 to 100%
  const [musicVolume, setMusicVolume] = useState(initialMusicVolume);
  const [voiceVolume, setVoiceVolume] = useState(initialVoiceVolume);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop everything when closed
  useEffect(() => {
    if (!isOpen) {
      stopRecordingProcess();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
        audioStreamRef.current = null;
      }
    }
  }, [isOpen]);

  // Sync video time updates during preview or recording
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setRecordProgress(p);
    }
  };

  const handleVideoEnded = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setIsPlayingPreview(false);
  };

  // Live Microphone Audio Visualizer (Waveform)
  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, '#FE2C55');
          gradient.addColorStop(1, '#25F4EE');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch {
      // Audio visualizer setup fallback
    }
  };

  // Start recording voiceover
  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicPermission(true);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        audioEngine.playFollowCheer();
      };

      recorder.start(100);
      setupAudioVisualizer(stream);

      // Play video in sync with recording
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true; // Mute video so mic doesn't catch echo
        videoRef.current.play();
      }

      setIsRecording(true);
    } catch {
      setMicPermission(false);
      alert('Microphone access is needed to record voiceover. Please allow microphone permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopRecordingProcess();
    setIsRecording(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const stopRecordingProcess = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  // Toggle preview play/pause with voiceover synced
  const togglePlayPreview = () => {
    if (!videoRef.current) return;

    if (isPlayingPreview) {
      videoRef.current.pause();
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      videoRef.current.currentTime = 0;
      if (audioPreviewRef.current) {
        audioPreviewRef.current.currentTime = 0;
        audioPreviewRef.current.volume = voiceVolume / 100;
        audioPreviewRef.current.play();
      }
      videoRef.current.volume = musicVolume / 100;
      videoRef.current.muted = musicVolume === 0;
      videoRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleDeleteVoiceover = () => {
    setRecordedAudioUrl(null);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.src = '';
    }
    setIsPlayingPreview(false);
    audioEngine.playHeartPop();
  };

  const handleSave = () => {
    onSaveVoiceover(recordedAudioUrl, musicVolume, voiceVolume);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between max-w-lg mx-auto select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 z-20">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-[#FE2C55]" />
          <h3 className="text-sm font-bold text-white">Voiceover Studio</h3>
        </div>

        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded-full bg-[#FE2C55] text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Done</span>
        </button>
      </div>

      {/* Synchronized Video Preview Viewport */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-black p-4">
        <div className="relative w-full h-full max-h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-zinc-950">
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            className="w-full h-full object-contain"
          />

          {/* Hidden voiceover audio element for synchronized playback */}
          {recordedAudioUrl && (
            <audio ref={audioPreviewRef} src={recordedAudioUrl} preload="auto" />
          )}

          {/* Live Waveform Canvas Overlay when recording */}
          {isRecording && (
            <div className="absolute inset-x-0 bottom-6 px-6 z-20 flex flex-col items-center pointer-events-none">
              <canvas
                ref={canvasRef}
                width={280}
                height={55}
                className="w-full max-w-[280px] h-[55px] drop-shadow-lg"
              />
              <div className="mt-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-red-500/50 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[11px] font-bold text-red-400 font-mono tracking-wider">
                  RECORDING VOICEOVER...
                </span>
              </div>
            </div>
          )}

          {/* Video Timeline Scrubber with Voiceover Segment indicator */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-white/20">
            <div
              className={`h-full transition-all ${
                isRecording ? 'bg-red-500' : 'bg-[#FE2C55]'
              }`}
              style={{ width: `${recordProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Voiceover Controls Panel */}
      <div className="p-4 bg-zinc-900 border-t border-white/10 z-20 space-y-4">
        {/* Audio Balance Sliders (Voiceover vs Original Music) */}
        {recordedAudioUrl && !isRecording && (
          <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-white/70">
                <span>Original Sound</span>
                <span className="text-white font-mono">{musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-full accent-[#25F4EE] h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-white/70">
                <span>Voiceover Voice</span>
                <span className="text-white font-mono">{voiceVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(Number(e.target.value))}
                className="w-full accent-[#FE2C55] h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action Controls Row */}
        <div className="flex items-center justify-around max-w-sm mx-auto">
          {/* Re-record / Trash button if voiceover exists */}
          {recordedAudioUrl && !isRecording ? (
            <button
              onClick={handleDeleteVoiceover}
              className="flex flex-col items-center gap-1 text-white/70 hover:text-red-400 active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Delete</span>
            </button>
          ) : (
            <div className="w-11" />
          )}

          {/* Big Center Microphone Record Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`relative w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all ${
                isRecording
                  ? 'border-red-500 bg-red-600/30 scale-105'
                  : 'border-white bg-[#FE2C55] hover:bg-[#e0264b] active:scale-95 shadow-xl shadow-[#FE2C55]/30'
              }`}
            >
              {isRecording ? (
                <div className="w-6 h-6 rounded-md bg-white animate-pulse" />
              ) : (
                <Mic className="w-8 h-8 text-white stroke-[2.2]" />
              )}
            </button>
            <span className="text-[11px] font-bold text-white">
              {isRecording ? 'Tap to Stop' : recordedAudioUrl ? 'Tap to Re-record' : 'Tap to Record'}
            </span>
          </div>

          {/* Preview Play/Pause button */}
          {recordedAudioUrl && !isRecording ? (
            <button
              onClick={togglePlayPreview}
              className="flex flex-col items-center gap-1 text-white/70 hover:text-white active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                {isPlayingPreview ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 translate-x-0.5 fill-white" />
                )}
              </div>
              <span className="text-[10px] font-medium">
                {isPlayingPreview ? 'Pause' : 'Listen'}
              </span>
            </button>
          ) : (
            <div className="w-11" />
          )}
        </div>
      </div>
    </div>
  );
};
