import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, RefreshCw, Sparkles, Clock, Music, Upload, Check, Play, Square, Sliders, Mic, Layers, Undo2, Plus, Gauge, Smile } from 'lucide-react';
import { Sound, VideoItem, TransitionType, VideoSegment, RecordingSpeed, PlacedSticker } from '../types';
import { MOCK_SOUNDS, CURRENT_USER } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';
import { FilterSelectionOverlay } from './FilterSelectionOverlay';
import { FILTER_PRESETS, FilterPreset } from '../utils/filterPresets';
import { VoiceoverModal } from './VoiceoverModal';
import { TransitionMenuModal } from './TransitionMenuModal';
import { SpeedControlOverlay, SPEED_OPTIONS } from './SpeedControlOverlay';
import { StickerPickerModal } from './StickerPickerModal';
import { InteractiveStickerCanvas } from './InteractiveStickerCanvas';

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishVideo: (newVideo: VideoItem) => void;
  initialSound?: Sound | null;
}

export const CreateVideoModal: React.FC<CreateVideoModalProps> = ({
  isOpen,
  onClose,
  onPublishVideo,
  initialSound,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Filter State
  const [selectedFilterId, setSelectedFilterId] = useState<string>('teal_orange');
  const [filterIntensity, setFilterIntensity] = useState<number>(85);
  const [showFilterPicker, setShowFilterPicker] = useState<boolean>(true);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [filterToast, setFilterToast] = useState<string | null>('Cinematic Teal & Orange applied');

  // Voiceover State
  const [showVoiceoverModal, setShowVoiceoverModal] = useState<boolean>(false);
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);
  const [voiceoverVolume, setVoiceoverVolume] = useState<number>(100);
  const [musicVolume, setMusicVolume] = useState<number>(40);

  // Multi-Segment Sequential Recording & Transitions State
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>('slide');
  const [transitionDuration, setTransitionDuration] = useState<number>(0.5);
  const [showTransitionModal, setShowTransitionModal] = useState<boolean>(false);

  // Interactive Stickers & Emojis State
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState<boolean>(false);

  const [speed, setSpeed] = useState<RecordingSpeed>('1x');
  const [showSpeedOverlay, setShowSpeedOverlay] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState<Sound>(initialSound || MOCK_SOUNDS[0]);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  // Add a newly chosen sticker/emoji onto the video canvas
  const handleAddSticker = (stickerDraft: Omit<PlacedSticker, 'id' | 'x' | 'y'>) => {
    const newSticker: PlacedSticker = {
      ...stickerDraft,
      id: 'stk_' + Date.now(),
      x: 50,
      y: 40 + ((placedStickers.length % 4) * 8),
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
    audioEngine.playHeartPop();
    setFilterToast(`Added ${newSticker.content} to canvas!`);
    setTimeout(() => setFilterToast(null), 1800);
  };

  // Sync playback rate with speed during review
  useEffect(() => {
    if (recordedVideoUrl && videoRef.current) {
      const mult = SPEED_OPTIONS.find((s) => s.id === speed)?.multiplier || 1.0;
      videoRef.current.playbackRate = mult;
    }
  }, [recordedVideoUrl, speed]);

  // Post / Publish state
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<VideoItem['category']>('dance');
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);
    } catch {
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioEngine.stop();
  };

  // Flip camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Trigger brief toast when filter changes
  const handleSelectFilter = (filterId: string) => {
    setSelectedFilterId(filterId);
    const preset = FILTER_PRESETS.find((f) => f.id === filterId);
    if (preset) {
      setFilterToast(`${preset.name} (${filterIntensity}%)`);
      setTimeout(() => setFilterToast(null), 1800);
    }
  };

  const handleChangeIntensity = (val: number) => {
    setFilterIntensity(val);
    const preset = FILTER_PRESETS.find((f) => f.id === selectedFilterId);
    if (preset) {
      setFilterToast(`${preset.name} (${val}%)`);
      setTimeout(() => setFilterToast(null), 1200);
    }
  };

  // Record timer synced with speed rate
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      audioEngine.playSound(selectedSound.beatType);
      const mult = SPEED_OPTIONS.find((s) => s.id === speed)?.multiplier || 1.0;
      const stepMs = Math.round(1000 / mult);

      interval = window.setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 15) {
            handleStopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, stepMs);
    }
    return () => clearInterval(interval);
  }, [isRecording, selectedSound, speed]);

  const handleStartRecording = () => {
    if (timerDuration > 0) {
      setCountdown(timerDuration);
      let count = timerDuration;
      const countInterval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          audioEngine.playHeartPop();
        } else {
          clearInterval(countInterval);
          setCountdown(null);
          startActualRecord();
        }
      }, 1000);
    } else {
      startActualRecord();
    }
  };

  const startActualRecord = () => {
    setRecordTime(0);
    setIsRecording(true);
    setShowFilterPicker(false);
    setShowSpeedOverlay(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    audioEngine.stop();

    const duration = Math.max(1, recordTime);
    const newTake: VideoSegment = {
      id: 'take_' + Date.now(),
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: duration,
      label: `Take ${segments.length + 1} (${speed})`,
      filterId: selectedFilterId,
      speed: speed,
    };
    const updated = [...segments, newTake];
    setSegments(updated);
    setRecordTime(0);

    audioEngine.playFollowCheer();
    setFilterToast(`Take ${updated.length} saved at ${speed} (${duration}s)!`);
    setTimeout(() => setFilterToast(null), 2500);
  };

  const handleFinishRecording = () => {
    if (segments.length === 0 && !recordedVideoUrl) {
      // If user hasn't recorded a segment yet, create a default take
      const defaultTake: VideoSegment = {
        id: 'take_1',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 8,
        label: 'Take 1',
        filterId: selectedFilterId,
      };
      setSegments([defaultTake]);
    }
    setRecordedVideoUrl(
      segments[0]?.url ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    );
  };

  const handleUndoTake = () => {
    if (segments.length === 0) return;
    const updated = segments.slice(0, -1);
    setSegments(updated);
    audioEngine.playHeartPop();
    setFilterToast(updated.length > 0 ? `Removed last take (${updated.length} takes left)` : 'All takes cleared');
    setTimeout(() => setFilterToast(null), 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
      setSegments([
        {
          id: 'upload_take_1',
          url,
          duration: 10,
          label: 'Imported Clip 1',
          filterId: selectedFilterId,
        },
      ]);
    }
  };

  const handlePublish = () => {
    if (!caption.trim()) return;
    setIsPosting(true);

    const tags = caption
      .split(' ')
      .filter((word) => word.startsWith('#'))
      .map((tag) => tag.replace('#', '').toLowerCase());

    const newVideo: VideoItem = {
      id: 'v_user_' + Date.now(),
      creator: CURRENT_USER,
      videoUrl:
        recordedVideoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: caption.trim(),
      tags: tags.length > 0 ? tags : ['tokvibe', 'viral', category],
      sound: selectedSound,
      likes: 1,
      commentsCount: 0,
      bookmarksCount: 0,
      sharesCount: 0,
      isLiked: true,
      category,
      createdAt: 'Just now',
      comments: [],
      filter: selectedFilterId,
      filterIntensity: filterIntensity,
      voiceoverUrl: voiceoverUrl || undefined,
      voiceoverVolume: voiceoverVolume,
      originalSoundVolume: musicVolume,
      segments: segments.length > 0 ? segments : undefined,
      transition: selectedTransition,
      transitionDuration: transitionDuration,
      speed: speed,
      stickers: placedStickers.length > 0 ? placedStickers : undefined,
    };

    setTimeout(() => {
      audioEngine.playFollowCheer();
      onPublishVideo(newVideo);
      setIsPosting(false);
      onClose();
    }, 600);
  };

  // Get current active preset and compute dynamic CSS style
  const activePreset: FilterPreset =
    FILTER_PRESETS.find((f) => f.id === selectedFilterId) || FILTER_PRESETS[0];

  const computedFilterStyle: React.CSSProperties = isComparing
    ? {}
    : activePreset.getStyle(filterIntensity);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="relative z-30 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Music Selector Button */}
        {!recordedVideoUrl && (
          <button
            onClick={() => setShowSoundPicker(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-white hover:bg-black/80 transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span className="truncate max-w-[140px]">{selectedSound.title}</span>
          </button>
        )}

        <div className="w-9" />
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-zinc-950">
        {/* On-Screen HUD Filter Change Notification Badge */}
        {filterToast && !isRecording && (
          <div className="absolute top-4 z-40 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FACE15]" />
            <span>{filterToast}</span>
          </div>
        )}

        {/* Speed HUD Indicator Badge */}
        {speed !== '1x' && !recordedVideoUrl && (
          <button
            onClick={() => {
              setShowSpeedOverlay(true);
              setShowFilterPicker(false);
            }}
            className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#25F4EE]/50 text-xs font-bold text-[#25F4EE] flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
          >
            <Gauge className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span>{speed} Speed</span>
          </button>
        )}

        {/* Multi-Segment Take Timeline Strip at Top */}
        {segments.length > 0 && !recordedVideoUrl && (
          <div className="absolute top-14 inset-x-4 z-30 flex items-center justify-between bg-black/75 backdrop-blur-md p-1.5 px-3 rounded-2xl border border-white/15 shadow-xl">
            <div className="flex-1 flex items-center gap-1.5 mr-2 overflow-x-auto no-scrollbar py-0.5">
              {segments.map((seg, idx) => (
                <React.Fragment key={seg.id}>
                  <div className="flex items-center gap-1 bg-[#25F4EE]/20 border border-[#25F4EE]/40 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#25F4EE] whitespace-nowrap">
                    <span>{seg.label}</span>
                    <span className="text-white/60">({seg.duration}s)</span>
                  </div>
                  {idx < segments.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setShowTransitionModal(true)}
                      className="px-1.5 py-0.5 rounded-full bg-purple-600/80 hover:bg-purple-500 text-[9px] font-black text-white hover:scale-110 active:scale-95 transition-all shadow"
                      title={`Transition: ${selectedTransition}`}
                    >
                      ⚡ {selectedTransition}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowTransitionModal(true)}
              className="text-[10px] font-bold text-purple-300 hover:text-white flex items-center gap-1 shrink-0 ml-1 py-1 px-2 rounded-lg bg-purple-950/50 border border-purple-500/30"
            >
              <Layers className="w-3 h-3 text-purple-300" />
              <span className="capitalize">{selectedTransition}</span>
            </button>
          </div>
        )}

        {/* Countdown Indicator Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-xs">
            <span className="text-8xl font-black text-[#FE2C55] animate-ping">
              {countdown}
            </span>
          </div>
        )}

        {/* Video Viewport: Live Stream or Recorded Clip */}
        {recordedVideoUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              src={recordedVideoUrl}
              autoPlay
              loop
              playsInline
              style={computedFilterStyle}
              className="w-full h-full object-contain transition-all duration-150"
            />
            {/* Sync voiceover audio playback during review */}
            {voiceoverUrl && (
              <audio autoPlay loop src={voiceoverUrl} />
            )}
          </div>
        ) : (
          /* Live Camera View */
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
            {hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={computedFilterStyle}
                className={`w-full h-full object-cover transition-all duration-150 ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                  <Camera className="w-10 h-10 text-[#25F4EE]" />
                </div>
                <div>
                  <h4 className="text-base font-bold">Studio Camera Ready</h4>
                  <p className="text-xs text-white/60 mt-1 max-w-xs">
                    You can record with live color grade filters or upload any vertical video file!
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-2 hover:bg-white/90"
                >
                  <Upload className="w-4 h-4" /> Upload Video File
                </button>
              </div>
            )}
          </div>
        )}

        {/* Real-time Aesthetic Overlay Layers */}
        {!isComparing && (
          <>
            {/* 1. VHS Scanlines + Vintage OSD Date Overlay */}
            {activePreset.overlayType === 'vhs' && (
              <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
                <div className="flex items-center justify-between font-mono text-[11px] text-cyan-300 drop-shadow">
                  <span>REC ● PLAY [SP]</span>
                  <span>1995-11-03</span>
                </div>
                <div className="font-mono text-[11px] text-cyan-300 drop-shadow">
                  <span>AUTO TRACKING · CH-03</span>
                </div>
              </div>
            )}

            {/* 2. Cinematic Teal & Orange Shadow Color Wash */}
            {activePreset.overlayType === 'teal_orange_wash' && (
              <div
                className="absolute inset-0 pointer-events-none z-20 mix-blend-soft-light transition-opacity"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(234, 88, 12, 0.25) 100%)',
                  opacity: filterIntensity / 100,
                }}
              />
            )}

            {/* 3. Golden Sunset Amber Bloom Diffusion */}
            {activePreset.overlayType === 'golden_bloom' && (
              <div
                className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity"
                style={{
                  background:
                    'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.15) 60%, transparent 100%)',
                  opacity: filterIntensity / 100,
                }}
              />
            )}

            {/* 4. Cyberpunk Neon Highlights Wash */}
            {activePreset.overlayType === 'cyberpunk_glow' && (
              <div
                className="absolute inset-0 pointer-events-none z-20 mix-blend-color-dodge transition-opacity"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(6, 182, 212, 0.15) 0%, rgba(236, 72, 153, 0.2) 100%)',
                  opacity: filterIntensity / 100,
                }}
              />
            )}

            {/* 5. Cinematic Vignette (Edges darkening) */}
            {(activePreset.overlayType === 'vignette' || activePreset.id === 'noir_film') && (
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background:
                    'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.65) 100%)',
                  opacity: filterIntensity / 100,
                }}
              />
            )}
          </>
        )}

        {/* Interactive Sticker & Emoji Placement Canvas (drag, scale, rotate, trash) */}
        <InteractiveStickerCanvas
          stickers={placedStickers}
          onUpdateStickers={setPlacedStickers}
          isInteractive={!isRecording}
        />

        {/* Right Tools Sidebar (Flip, Filters, Stickers, Speed, Timer) */}
        {!recordedVideoUrl && !showFilterPicker && (
          <div className="absolute right-4 top-20 z-20 flex flex-col items-center gap-4">
            {/* Flip Camera */}
            <button
              onClick={handleFlipCamera}
              className="flex flex-col items-center text-white/90 gap-1 active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Flip</span>
            </button>

            {/* Filter Selection Overlay Toggle */}
            <button
              onClick={() => setShowFilterPicker(true)}
              className="flex flex-col items-center text-white/90 gap-1 active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-[#FE2C55]/20 backdrop-blur-md flex items-center justify-center border-2 border-[#FE2C55] shadow-lg shadow-[#FE2C55]/30">
                <Sparkles className="w-5 h-5 text-[#FACE15]" />
              </div>
              <span className="text-[10px] font-bold text-[#FACE15]">Filters</span>
            </button>

            {/* Interactive Stickers & Emojis Menu Toggle */}
            <button
              onClick={() => setShowStickerPicker(true)}
              className="flex flex-col items-center text-white/90 gap-1 active:scale-90 transition-transform"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                  placedStickers.length > 0
                    ? 'bg-[#FACE15]/25 border-[#FACE15] text-[#FACE15] shadow-lg shadow-[#FACE15]/30'
                    : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
                }`}
              >
                <Smile className="w-5 h-5 text-[#FACE15]" />
              </div>
              <span className="text-[10px] font-medium">
                {placedStickers.length > 0 ? `Stickers (${placedStickers.length})` : 'Stickers'}
              </span>
            </button>

            {/* Voiceover Button */}
            <button
              onClick={() => setShowVoiceoverModal(true)}
              className="flex flex-col items-center text-white/90 gap-1 active:scale-90 transition-transform"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                  voiceoverUrl
                    ? 'bg-[#FE2C55] border-white text-white shadow-lg shadow-[#FE2C55]/30'
                    : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
                }`}
              >
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium">
                {voiceoverUrl ? 'Voiceover ✓' : 'Voiceover'}
              </span>
            </button>

            {/* Transition Effects Menu Toggle */}
            <button
              onClick={() => setShowTransitionModal(true)}
              className="flex flex-col items-center text-white/90 gap-1 active:scale-90 transition-transform"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                  selectedTransition !== 'none'
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20'
                    : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
                }`}
              >
                <Layers className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-[10px] font-medium truncate max-w-[50px]">
                {selectedTransition !== 'none' ? selectedTransition : 'Transition'}
              </span>
            </button>

            {/* Speed Control Overlay Toggle */}
            <button
              onClick={() => {
                setShowSpeedOverlay(!showSpeedOverlay);
                setShowFilterPicker(false);
              }}
              className="flex flex-col items-center text-white/90 gap-1 active:scale-90 transition-transform"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border text-xs font-bold transition-all ${
                  showSpeedOverlay || speed !== '1x'
                    ? 'bg-[#25F4EE]/25 border-[#25F4EE] text-[#25F4EE] shadow-lg shadow-[#25F4EE]/30'
                    : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
                }`}
              >
                {speed}
              </div>
              <span className="text-[10px] font-medium">Speed</span>
            </button>

            {/* Timer Toggle */}
            <button
              onClick={() => {
                const timers = [0, 3, 10];
                const nextIdx = (timers.indexOf(timerDuration) + 1) % timers.length;
                setTimerDuration(timers[nextIdx]);
              }}
              className="flex flex-col items-center text-white/90 gap-1 active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">
                {timerDuration === 0 ? 'Timer' : `${timerDuration}s`}
              </span>
            </button>
          </div>
        )}

        {/* Real-Time Video Filter Selection Overlay */}
        <FilterSelectionOverlay
          isOpen={showFilterPicker && !recordedVideoUrl}
          onClose={() => setShowFilterPicker(false)}
          selectedFilterId={selectedFilterId}
          onSelectFilter={handleSelectFilter}
          intensity={filterIntensity}
          onChangeIntensity={handleChangeIntensity}
          isComparing={isComparing}
          setIsComparing={setIsComparing}
        />

        {/* Speed Control Overlay */}
        <SpeedControlOverlay
          isOpen={showSpeedOverlay && !recordedVideoUrl}
          onClose={() => setShowSpeedOverlay(false)}
          speed={speed}
          onChangeSpeed={(newSpeed) => {
            setSpeed(newSpeed);
            setFilterToast(`Speed set to ${newSpeed}`);
            setTimeout(() => setFilterToast(null), 1800);
          }}
        />
      </div>

      {/* Hidden File Input for Device Video Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Bottom Controls Area */}
      <div className="relative z-30 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {recordedVideoUrl ? (
          /* Publishing Screen */
          <div className="space-y-4 max-w-md mx-auto">
            {/* Filter Indicator, Voiceover, Stickers & Speed on Review screen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <div className="flex items-center justify-between bg-white/5 border border-white/10 px-2.5 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-1 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-[#FACE15] shrink-0" />
                  <span className="font-semibold text-white/90 truncate text-[11px]">
                    {activePreset.name}
                  </span>
                </div>
              </div>

              {/* Speed Review Indicator */}
              <button
                type="button"
                onClick={() => {
                  const speeds: RecordingSpeed[] = ['0.3x', '0.5x', '1x', '2x', '3x'];
                  const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
                  setSpeed(speeds[nextIdx]);
                }}
                className="flex items-center justify-between bg-white/5 border border-white/10 px-2.5 py-2 rounded-xl text-xs hover:bg-white/10 transition-colors"
                title="Click to cycle playback speed"
              >
                <div className="flex items-center gap-1 truncate">
                  <Gauge className="w-3.5 h-3.5 text-[#25F4EE] shrink-0" />
                  <span className="font-semibold text-white/90 truncate text-[11px]">
                    {speed}
                  </span>
                </div>
                <span className="text-[10px] text-[#25F4EE] font-bold shrink-0">
                  Speed
                </span>
              </button>

              {/* Voiceover Review Button */}
              <button
                type="button"
                onClick={() => setShowVoiceoverModal(true)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs transition-colors ${
                  voiceoverUrl
                    ? 'bg-[#FE2C55]/20 border-[#FE2C55] text-white'
                    : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1 truncate">
                  <Mic className={`w-3.5 h-3.5 shrink-0 ${voiceoverUrl ? 'text-[#FE2C55]' : 'text-[#25F4EE]'}`} />
                  <span className="font-semibold truncate text-[11px]">
                    {voiceoverUrl ? 'Voiceover' : 'Voice'}
                  </span>
                </div>
                <span className="text-[10px] text-[#25F4EE] font-bold shrink-0">
                  {voiceoverUrl ? '✓' : '+'}
                </span>
              </button>

              {/* Stickers Review Button */}
              <button
                type="button"
                onClick={() => setShowStickerPicker(true)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs transition-colors ${
                  placedStickers.length > 0
                    ? 'bg-[#FACE15]/20 border-[#FACE15] text-[#FACE15]'
                    : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                }`}
                title="Add or edit interactive stickers & emojis"
              >
                <div className="flex items-center gap-1 truncate">
                  <Smile className="w-3.5 h-3.5 text-[#FACE15] shrink-0" />
                  <span className="font-semibold truncate text-[11px]">
                    {placedStickers.length > 0 ? `Stickers (${placedStickers.length})` : 'Stickers'}
                  </span>
                </div>
                <span className="text-[10px] text-[#FACE15] font-bold shrink-0">
                  +
                </span>
              </button>
            </div>

            {/* Multi-Segment Transition Option */}
            <button
              type="button"
              onClick={() => setShowTransitionModal(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-white hover:bg-purple-950/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-300 shrink-0" />
                <span className="font-semibold text-white/90">
                  Cut Transition: <span className="text-purple-300 font-bold uppercase">{selectedTransition}</span> ({transitionDuration}s)
                </span>
              </div>
              <span className="text-[11px] text-[#25F4EE] font-bold hover:underline shrink-0">
                Change Effect
              </span>
            </button>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Describe your video & add #hashtags
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Yeh video kis bare me hai? #dance #comedy #viral..."
                rows={2}
                className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
              />
            </div>

            {/* Quick Hashtags */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['#dance', '#comedy', '#viral', '#streetfood', '#aesthetic', '#fyp', '#tokvibe'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setCaption((prev) => prev + ' ' + tag)}
                  className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 text-[11px] font-medium shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Action Buttons: Retake vs Post */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRecordedVideoUrl(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Retake Video
              </button>
              <button
                onClick={handlePublish}
                disabled={!caption.trim() || isPosting}
                className="flex-1 py-3 rounded-xl bg-[#FE2C55] hover:bg-[#e0264b] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-[#FE2C55]/30"
              >
                {isPosting ? (
                  <span>Posting...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Post Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Camera Controls Bar: Upload/Undo, Record Button, Review/Filters */
          <div className="flex items-center justify-around max-w-sm mx-auto">
            {/* Undo Take or Upload Button */}
            {segments.length > 0 ? (
              <button
                onClick={handleUndoTake}
                className="flex flex-col items-center gap-1 text-white/80 hover:text-red-400 active:scale-90 transition-all"
                title="Undo last recorded take"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Undo2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">Undo</span>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-white/80 hover:text-white"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">Upload</span>
              </button>
            )}

            {/* Center Record Button */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
            >
              {isRecording ? (
                <div className="w-8 h-8 rounded-md bg-[#FE2C55] animate-pulse flex items-center justify-center">
                  <Square className="w-4 h-4 fill-white text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#FE2C55] group-hover:scale-105 transition-transform" />
              )}
              {isRecording && (
                <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-mono text-[#FE2C55]">
                  00:{recordTime.toString().padStart(2, '0')} / 15s
                </div>
              )}
            </button>

            {/* Review Button if takes exist, or Filters toggle */}
            {segments.length > 0 ? (
              <button
                onClick={handleFinishRecording}
                className="flex flex-col items-center gap-1 text-white/90 hover:text-white active:scale-90 transition-all"
                title="Finish and review all recorded takes"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400">Done ({segments.length})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowFilterPicker(!showFilterPicker)}
                className="flex flex-col items-center gap-1 text-white/80 hover:text-white"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#FACE15]" />
                </div>
                <span className="text-[10px] font-medium">Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sound Selector Modal */}
      {showSoundPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end">
          <div className="w-full max-w-lg mx-auto bg-[#18181b] rounded-t-2xl p-4 border-t border-white/10 max-h-[60vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white">Select Sound Track</h4>
              <button
                onClick={() => setShowSoundPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 py-3 flex-1 no-scrollbar">
              {MOCK_SOUNDS.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSound(s);
                    audioEngine.playSound(s.beatType);
                    setShowSoundPicker(false);
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    selectedSound.id === s.id ? 'bg-white/15' : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={s.coverUrl}
                    alt={s.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{s.title}</p>
                    <p className="text-[11px] text-white/50 truncate">{s.artist}</p>
                  </div>
                  {selectedSound.id === s.id && (
                    <Check className="w-4 h-4 text-[#25F4EE] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voiceover Recording Studio Modal */}
      {showVoiceoverModal && (
        <VoiceoverModal
          isOpen={showVoiceoverModal}
          onClose={() => setShowVoiceoverModal(false)}
          videoUrl={
            recordedVideoUrl ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          }
          onSaveVoiceover={(audioUrl, musicVol, voiceVol) => {
            setVoiceoverUrl(audioUrl);
            setMusicVolume(musicVol);
            setVoiceoverVolume(voiceVol);
          }}
          initialVoiceoverUrl={voiceoverUrl}
          initialMusicVolume={musicVolume}
          initialVoiceVolume={voiceoverVolume}
        />
      )}

      {/* Transition Effects Menu Modal */}
      {showTransitionModal && (
        <TransitionMenuModal
          isOpen={showTransitionModal}
          onClose={() => setShowTransitionModal(false)}
          selectedTransition={selectedTransition}
          onSelectTransition={(type, dur) => {
            setSelectedTransition(type);
            setTransitionDuration(dur);
            setFilterToast(`Transition set: ${type.toUpperCase()} (${dur}s)`);
            setTimeout(() => setFilterToast(null), 2000);
          }}
          segments={segments}
          currentDuration={transitionDuration}
        />
      )}

      {/* Interactive Sticker & Emoji Picker Modal */}
      {showStickerPicker && (
        <StickerPickerModal
          isOpen={showStickerPicker}
          onClose={() => setShowStickerPicker(false)}
          onSelectSticker={handleAddSticker}
        />
      )}
    </div>
  );
};
