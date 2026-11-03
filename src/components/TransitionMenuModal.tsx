import React, { useState } from 'react';
import { X, Check, Play, Sparkles, Layers, Sliders, ArrowRight } from 'lucide-react';
import { TransitionType, VideoSegment } from '../types';
import { TRANSITION_PRESETS, TransitionPreset } from '../utils/transitionPresets';
import { audioEngine } from '../utils/audioEngine';

interface TransitionMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTransition: TransitionType;
  onSelectTransition: (type: TransitionType, duration: number) => void;
  segments: VideoSegment[];
  currentDuration?: number;
}

export const TransitionMenuModal: React.FC<TransitionMenuModalProps> = ({
  isOpen,
  onClose,
  selectedTransition,
  onSelectTransition,
  segments,
  currentDuration = 0.5,
}) => {
  const [activeType, setActiveType] = useState<TransitionType>(selectedTransition);
  const [transitionSpeed, setTransitionSpeed] = useState<number>(currentDuration);
  const [previewing, setPreviewing] = useState<boolean>(false);
  const [previewPhase, setPreviewPhase] = useState<'A' | 'B'>('A');

  if (!isOpen) return null;

  const handleTestPreview = (type: TransitionType) => {
    setActiveType(type);
    setPreviewing(true);
    setPreviewPhase('A');

    // Trigger audio effect for transition
    if (type === 'flash' || type === 'zoom') {
      audioEngine.playHeartPop();
    } else if (type === 'glitch') {
      audioEngine.playGlitchSound();
    } else if (type !== 'none') {
      audioEngine.playWhooshSound();
    }

    setTimeout(() => {
      setPreviewPhase('B');
    }, 450);

    setTimeout(() => {
      setPreviewing(false);
      setPreviewPhase('A');
    }, 1400);
  };

  const handleApply = () => {
    audioEngine.playFollowCheer();
    onSelectTransition(activeType, transitionSpeed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end max-w-lg mx-auto select-none animate-in fade-in duration-200">
      <div className="w-full bg-[#18181b] rounded-t-3xl border-t border-white/10 p-5 max-h-[85vh] flex flex-col overflow-y-auto no-scrollbar shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#25F4EE]" />
            <h3 className="text-sm font-bold text-white">Clip Transitions</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Segment Timeline Overview */}
        <div className="mb-4 bg-black/50 p-3 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/60 mb-2">
            <span>Recorded Take Segments ({segments.length || 2} clips)</span>
            <span className="text-[#25F4EE] font-bold">
              {activeType === 'none' ? 'Direct Cut' : `${activeType.toUpperCase()} Transition`}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {(segments.length > 0
              ? segments
              : [
                  { id: 'take_1', label: 'Take 1', duration: 4.2 },
                  { id: 'take_2', label: 'Take 2', duration: 5.0 },
                ]
            ).map((seg, idx, arr) => (
              <React.Fragment key={seg.id || idx}>
                {/* Segment Box */}
                <div className="px-3 py-2 rounded-xl bg-zinc-800 border border-white/10 flex flex-col items-center shrink-0 min-w-[70px]">
                  <span className="text-xs font-bold text-white">{seg.label || `Take ${idx + 1}`}</span>
                  <span className="text-[10px] text-white/50">{seg.duration?.toFixed(1) || '3.5'}s</span>
                </div>

                {/* Transition Node Connector */}
                {idx < arr.length - 1 && (
                  <div className="flex flex-col items-center justify-center shrink-0 px-1">
                    <div className="px-2 py-0.5 rounded-full bg-[#FE2C55]/20 border border-[#FE2C55]/50 text-[10px] font-bold text-[#FE2C55] flex items-center gap-1">
                      <span>{activeType}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/40 mt-0.5" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Live Mini Preview Box */}
        <div className="mb-4 relative w-full h-28 rounded-2xl overflow-hidden bg-black border border-white/15 flex items-center justify-center">
          {/* Clip A */}
          <div
            className={`absolute inset-0 flex items-center justify-center text-xs font-extrabold text-white transition-all duration-300 ${
              previewPhase === 'A'
                ? 'opacity-100 scale-100'
                : activeType === 'fade'
                ? 'opacity-0'
                : activeType === 'slide'
                ? '-translate-x-full'
                : activeType === 'wipe'
                ? 'clip-path-wipe'
                : activeType === 'zoom'
                ? 'scale-150 blur-sm opacity-0'
                : activeType === 'flash'
                ? 'brightness-200 opacity-20'
                : activeType === 'glitch'
                ? 'skew-x-12 opacity-30'
                : 'opacity-0'
            }`}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)',
            }}
          >
            <span>TAKE 1</span>
          </div>

          {/* Clip B */}
          <div
            className={`absolute inset-0 flex items-center justify-center text-xs font-extrabold text-white transition-all duration-300 ${
              previewPhase === 'B'
                ? 'opacity-100 scale-100 translate-x-0'
                : activeType === 'fade'
                ? 'opacity-0'
                : activeType === 'slide'
                ? 'translate-x-full'
                : activeType === 'zoom'
                ? 'scale-75 opacity-0'
                : 'opacity-0'
            }`}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #831843 100%)',
            }}
          >
            <span>TAKE 2</span>
          </div>

          {/* White Flash Effect Layer */}
          {activeType === 'flash' && previewing && (
            <div className="absolute inset-0 bg-white pointer-events-none animate-ping opacity-60 z-30" />
          )}

          {/* Preview Action CTA Overlay */}
          <button
            onClick={() => handleTestPreview(activeType)}
            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1 hover:bg-black"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Play Preview</span>
          </button>
        </div>

        {/* Transition Speed Selector */}
        <div className="mb-4 flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-white/70 font-semibold">
            <Sliders className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span>Duration:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { val: 0.3, label: '0.3s (Snappy)' },
              { val: 0.5, label: '0.5s (Smooth)' },
              { val: 0.8, label: '0.8s (Cinematic)' },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => setTransitionSpeed(spd.val)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  transitionSpeed === spd.val
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transition Presets Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {TRANSITION_PRESETS.map((preset: TransitionPreset) => {
            const isSelected = activeType === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleTestPreview(preset.id)}
                className={`flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-white/15 border-[#FE2C55] ring-1 ring-[#FE2C55]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#FE2C55] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/50 truncate">{preset.subtitle}</p>
                  <p className="text-[9px] text-white/40 line-clamp-1 mt-1">{preset.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Apply CTA Button */}
        <button
          onClick={handleApply}
          className="w-full py-3 rounded-xl bg-[#FE2C55] hover:bg-[#e0264b] active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#FE2C55]/25 transition-all"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Apply Transition Effect</span>
        </button>
      </div>
    </div>
  );
};
