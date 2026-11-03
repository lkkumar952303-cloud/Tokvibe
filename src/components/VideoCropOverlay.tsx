import React from 'react';
import { Crop, Scan, Check, RotateCcw, Smartphone, Sparkles, X, Target } from 'lucide-react';
import { VideoCropConfig } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface VideoCropOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cropConfig: VideoCropConfig;
  onChangeCrop: (updated: Partial<VideoCropConfig>) => void;
  onAutoDetectFace: () => void;
  isScanningFace: boolean;
}

export const VideoCropOverlay: React.FC<VideoCropOverlayProps> = ({
  isOpen,
  onClose,
  cropConfig,
  onChangeCrop,
  onAutoDetectFace,
  isScanningFace,
}) => {
  if (!isOpen) return null;

  const handlePresetSelect = (preset: 'face_auto' | 'left' | 'center' | 'right') => {
    audioEngine.playHeartPop();
    if (preset === 'face_auto') {
      onChangeCrop({ mode: 'face_auto' });
      onAutoDetectFace();
    } else if (preset === 'left') {
      onChangeCrop({ x: 30, y: 45, mode: 'manual' });
    } else if (preset === 'center') {
      onChangeCrop({ x: 50, y: 50, mode: 'center' });
    } else if (preset === 'right') {
      onChangeCrop({ x: 70, y: 45, mode: 'manual' });
    }
  };

  const handleReset = () => {
    audioEngine.playHeartPop();
    onChangeCrop({ x: 50, y: 50, zoom: 1.0, mode: 'center' });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black via-zinc-950/95 to-transparent pt-10 pb-6 px-4 animate-in slide-in-from-bottom duration-200 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#25F4EE]/20 flex items-center justify-center text-[#25F4EE]">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                Smart Face Crop & Framing
                <span className="text-[10px] px-1.5 py-0.2 bg-[#25F4EE]/20 text-[#25F4EE] rounded font-mono font-bold">
                  9:16 Mobile
                </span>
              </span>
              <p className="text-[10px] text-white/50">
                {cropConfig.mode === 'face_auto'
                  ? 'Subject face detected and locked in center'
                  : 'Manual pan & focal centering'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-[10px] flex items-center gap-1"
              title="Reset to center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Auto Face Centering Banner */}
        <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                cropConfig.mode === 'face_auto'
                  ? 'bg-[#25F4EE] text-black shadow-md shadow-[#25F4EE]/30'
                  : 'bg-zinc-800 text-white/70'
              }`}
            >
              {isScanningFace ? (
                <Scan className="w-5 h-5 animate-spin text-black" />
              ) : (
                <Target className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Auto Face Tracking & Centering</span>
                {cropConfig.mode === 'face_auto' && (
                  <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-white/50 font-mono">
                {isScanningFace
                  ? 'Scanning video frames...'
                  : `Offset: ${cropConfig.x}% H · ${cropConfig.y}% V · ${cropConfig.zoom.toFixed(1)}x Zoom`}
              </div>
            </div>
          </div>

          <button
            onClick={() => handlePresetSelect('face_auto')}
            disabled={isScanningFace}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md ${
              cropConfig.mode === 'face_auto'
                ? 'bg-[#25F4EE] text-black hover:bg-[#1fd4cf]'
                : 'bg-[#FE2C55] text-white hover:bg-[#e0264b]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isScanningFace ? 'Scanning...' : 'Auto-Center'}</span>
          </button>
        </div>

        {/* Framing Presets (Face Lock, Left, Center, Right) */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'face_auto', label: 'Face Track', icon: Target },
            { id: 'center', label: 'Center (50%)', icon: Smartphone },
            { id: 'left', label: 'Left (30%)', icon: Crop },
            { id: 'right', label: 'Right (70%)', icon: Crop },
          ].map((preset) => {
            const isActive =
              (preset.id === 'face_auto' && cropConfig.mode === 'face_auto') ||
              (preset.id === 'center' && cropConfig.mode === 'center') ||
              (preset.id === 'left' && cropConfig.mode === 'manual' && cropConfig.x <= 35) ||
              (preset.id === 'right' && cropConfig.mode === 'manual' && cropConfig.x >= 65);

            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id as any)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  isActive
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-zinc-900/80 text-white/60 border-white/10 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <preset.icon className="w-3.5 h-3.5" />
                <span className="truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Fine-Tuning Sliders (Horizontal Pan, Vertical Framing, Zoom) */}
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-2.5">
          {/* Horizontal Pan */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-white/60 w-16 shrink-0">
              Pan X ({cropConfig.x}%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={cropConfig.x}
              onChange={(e) =>
                onChangeCrop({ x: Number(e.target.value), mode: 'manual' })
              }
              className="w-full accent-[#25F4EE] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* Vertical Framing */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-white/60 w-16 shrink-0">
              Pan Y ({cropConfig.y}%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={cropConfig.y}
              onChange={(e) =>
                onChangeCrop({ y: Number(e.target.value), mode: 'manual' })
              }
              className="w-full accent-[#25F4EE] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* Zoom / Scale */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-white/60 w-16 shrink-0">
              Scale ({cropConfig.zoom.toFixed(1)}x)
            </span>
            <input
              type="range"
              min="1.0"
              max="2.2"
              step="0.05"
              value={cropConfig.zoom}
              onChange={(e) =>
                onChangeCrop({ zoom: Number(e.target.value), mode: 'manual' })
              }
              className="w-full accent-[#FE2C55] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Done / Apply Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-white/90 active:scale-95 transition-all shadow-lg"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Apply 9:16 Centered Crop</span>
        </button>
      </div>
    </div>
  );
};
