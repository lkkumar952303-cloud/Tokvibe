import React, { useRef, useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { VideoItem } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { FILTER_PRESETS } from '../utils/filterPresets';
import { InteractiveStickerCanvas } from './InteractiveStickerCanvas';

interface VideoPlayerProps {
  video: VideoItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onDoubleTapHeart: (x: number, y: number) => void;
  progress: number;
  setProgress: (val: number) => void;
  seekPercent: number | null;
  onSeekComplete: () => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  onEnded?: () => void;
  autoAdvance?: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onDoubleTapHeart,
  setProgress,
  seekPercent,
  onSeekComplete,
  isPlaying,
  setIsPlaying,
  onEnded,
  autoAdvance = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const lastTapRef = useRef<number>(0);
  const hasTriggeredEndRef = useRef<boolean>(false);

  // Sync seek requests
  useEffect(() => {
    if (seekPercent !== null && videoRef.current && videoRef.current.duration) {
      const targetTime = seekPercent * videoRef.current.duration;
      videoRef.current.currentTime = targetTime;
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.currentTime = targetTime;
      }
      onSeekComplete();
    }
  }, [seekPercent, onSeekComplete]);

  // Autoplay / pause based on active state
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            audioEngine.playSound(video.sound.beatType);
            if (voiceoverAudioRef.current) {
              voiceoverAudioRef.current.currentTime = videoRef.current?.currentTime || 0;
              voiceoverAudioRef.current.volume = (video.voiceoverVolume ?? 100) / 100;
              voiceoverAudioRef.current.muted = isMuted;
              voiceoverAudioRef.current.play().catch(() => {});
            }
          })
          .catch(() => {
            // Browser autoplay restrictions fallback
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      if (voiceoverAudioRef.current) {
        voiceoverAudioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isActive, video.sound.beatType, video.voiceoverUrl, video.voiceoverVolume, isMuted, setIsPlaying]);

  // Handle Mute state change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.muted = isMuted;
    }
    audioEngine.setMuted(isMuted);
  }, [isMuted]);

  // Reset end trigger flag when video changes or seeks
  useEffect(() => {
    hasTriggeredEndRef.current = false;
  }, [video.id, seekPercent]);

  // Apply recording speed multiplier if set on video
  useEffect(() => {
    if (videoRef.current && video.speed) {
      const speedMap: Record<string, number> = {
        '0.3x': 0.3,
        '0.5x': 0.5,
        '1x': 1.0,
        '2x': 2.0,
        '3x': 3.0,
      };
      videoRef.current.playbackRate = speedMap[video.speed] || 1.0;
    }
  }, [video.speed, isActive]);

  // Time update for timeline
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      const p = current / dur;
      setProgress(isNaN(p) ? 0 : p);

      // Trigger auto-advance when approaching final fraction of second if browser didn't fire onEnded
      if (autoAdvance && onEnded && dur > 1 && current >= dur - 0.25) {
        if (!hasTriggeredEndRef.current) {
          hasTriggeredEndRef.current = true;
          onEnded();
        }
      }
    }
  };

  // Canvas visualizer fallback for 100% reliable motion
  useEffect(() => {
    if (!videoError || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark energetic gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Dynamic animated sound rings & energetic dancing visuals
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const radius = Math.sin(t + i) * 60 + 120 + i * 35;
        ctx.arc(w / 2, h / 2 - 40, Math.max(10, radius), 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(37, 244, 238, 0.4)' : 'rgba(254, 44, 85, 0.4)';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [videoError, isActive]);

  // Fallback auto-advance for canvas visualizer if video media fails
  useEffect(() => {
    if (videoError && isActive && autoAdvance && onEnded) {
      const timer = setTimeout(() => {
        onEnded();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [videoError, isActive, autoAdvance, onEnded]);

  // Click & Double Tap Handler
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.clientX;
    const y = rect ? e.clientY - rect.top : e.clientY;

    if (now - lastTapRef.current < 320) {
      // Double Tap detected!
      const newHeart: FloatingHeart = {
        id: now,
        x,
        y,
        rotation: (Math.random() - 0.5) * 35,
      };
      setFloatingHearts((prev) => [...prev, newHeart]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 900);

      onDoubleTapHeart(x, y);
      audioEngine.playHeartPop();
      lastTapRef.current = 0;
    } else {
      // Single Tap: Toggle Play / Pause
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now && videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            audioEngine.playSound(video.sound.beatType);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
            audioEngine.stop();
          }
        }
      }, 300);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Determine filter style if this video has a filter
  const filterPreset = video.filter ? FILTER_PRESETS.find((f) => f.id === video.filter) : null;
  const filterIntensity = video.filterIntensity ?? 85;
  const videoFilterStyle: React.CSSProperties = filterPreset ? filterPreset.getStyle(filterIntensity) : {};

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none"
    >
      {/* Real Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        loop={!autoAdvance}
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (autoAdvance && onEnded) {
            onEnded();
          }
        }}
        onError={() => setVideoError(true)}
        style={videoFilterStyle}
        className={`w-full h-full object-cover md:object-contain bg-black ${
          videoError ? 'hidden' : 'block'
        }`}
      />

      {/* Synchronized Voiceover Track Element */}
      {video.voiceoverUrl && (
        <audio ref={voiceoverAudioRef} src={video.voiceoverUrl} loop preload="auto" />
      )}

      {/* Aesthetic Overlay Layer if video was created with a filter */}
      {filterPreset?.overlayType === 'vhs' && (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
          <div className="flex items-center justify-between font-mono text-[10px] text-cyan-300 drop-shadow">
            <span>REC ● PLAY [SP]</span>
            <span>VHS RETRO</span>
          </div>
        </div>
      )}
      {filterPreset?.overlayType === 'teal_orange_wash' && (
        <div
          className="absolute inset-0 pointer-events-none z-10 mix-blend-soft-light"
          style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%)',
            opacity: filterIntensity / 100,
          }}
        />
      )}

      {/* Fallback Animated Canvas */}
      {videoError && (
        <canvas
          ref={canvasRef}
          width={400}
          height={720}
          className="w-full h-full object-cover"
        />
      )}

      {/* Animated Play / Pause Indicator in Center */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl transition-transform transform scale-110">
            <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Interactive Placed Stickers on Feed Video */}
      {video.stickers && video.stickers.length > 0 && (
        <InteractiveStickerCanvas
          stickers={video.stickers}
          isInteractive={false}
        />
      )}

      {/* Floating Burst Hearts from Double Tap */}
      {floatingHearts.map((h) => (
        <div
          key={h.id}
          className="absolute pointer-events-none z-30 animate-heart-burst"
          style={{
            left: `${h.x - 45}px`,
            top: `${h.y - 45}px`,
          }}
        >
          <svg
            className="w-24 h-24 text-[#FE2C55] fill-[#FE2C55] drop-shadow-2xl"
            viewBox="0 0 24 24"
            style={{ transform: `rotate(${h.rotation}deg)` }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      {/* Top Floating Controls: Mute & Fullscreen */}
      <div className="absolute top-16 right-4 z-20 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg active:scale-95"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
        <button
          onClick={toggleFullscreen}
          title="Fullscreen"
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg active:scale-95 hidden sm:flex"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
