import React from 'react';
import { X, Gauge, Zap, Turtle, Rabbit, Flame } from 'lucide-react';
import { RecordingSpeed } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface SpeedControlOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  speed: RecordingSpeed;
  onChangeSpeed: (speed: RecordingSpeed) => void;
}

export const SPEED_OPTIONS: {
  id: RecordingSpeed;
  multiplier: number;
  label: string;
  name: string;
  description: string;
  icon: typeof Gauge;
  pillColor: string;
}[] = [
  {
    id: '0.3x',
    multiplier: 0.3,
    label: '0.3x',
    name: 'Slower',
    description: 'Epic slow motion for dramatic stunts & dance moves',
    icon: Turtle,
    pillColor: 'bg-cyan-500 text-black',
  },
  {
    id: '0.5x',
    multiplier: 0.5,
    label: '0.5x',
    name: 'Slow',
    description: 'Smooth slow-mo, perfect for fluid choreography',
    icon: Turtle,
    pillColor: 'bg-cyan-400 text-black',
  },
  {
    id: '1x',
    multiplier: 1.0,
    label: '1x',
    name: 'Standard',
    description: 'Natural real-time recording speed',
    icon: Gauge,
    pillColor: 'bg-white text-black',
  },
  {
    id: '2x',
    multiplier: 2.0,
    label: '2x',
    name: 'Fast',
    description: 'Upbeat fast-forward action, energetic comedy & transitions',
    icon: Rabbit,
    pillColor: 'bg-[#FE2C55] text-white',
  },
  {
    id: '3x',
    multiplier: 3.0,
    label: '3x',
    name: 'Timelapse',
    description: 'High-speed timelapse for recipes, art & rapid scenes',
    icon: Zap,
    pillColor: 'bg-amber-400 text-black',
  },
];

export const SpeedControlOverlay: React.FC<SpeedControlOverlayProps> = ({
  isOpen,
  onClose,
  speed,
  onChangeSpeed,
}) => {
  if (!isOpen) return null;

  const currentOption = SPEED_OPTIONS.find((s) => s.id === speed) || SPEED_OPTIONS[2];
  const IconComponent = currentOption.icon;

  const handleSelect = (s: RecordingSpeed) => {
    onChangeSpeed(s);
    if (s === '2x' || s === '3x') {
      audioEngine.playHeartPop();
    } else if (s === '0.3x' || s === '0.5x') {
      audioEngine.playWhooshSound();
    } else {
      audioEngine.playHeartPop();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-24 z-35 px-4 pointer-events-auto select-none animate-in slide-in-from-bottom-2 duration-150">
      <div className="max-w-md mx-auto bg-black/85 backdrop-blur-lg border border-white/15 rounded-3xl p-3.5 shadow-2xl">
        {/* Top Header of Overlay */}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#25F4EE]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Recording Speed
            </span>
            <span className="text-[11px] font-bold text-[#25F4EE]">
              · {currentOption.label} ({currentOption.name})
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Segmented Pill Selector Bar */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-white/10 mb-2.5">
          {SPEED_OPTIONS.map((opt) => {
            const isSelected = speed === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 relative ${
                  isSelected
                    ? `${opt.pillColor} font-black shadow-md scale-102`
                    : 'text-white/70 hover:text-white hover:bg-white/5 font-semibold'
                }`}
              >
                <span className="text-xs">{opt.label}</span>
                <span className={`text-[9px] ${isSelected ? 'opacity-90' : 'text-white/40'}`}>
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Contextual Description */}
        <div className="flex items-center gap-2 px-2 py-1 text-white/60 text-[11px] bg-white/5 rounded-xl border border-white/5">
          <IconComponent className="w-3.5 h-3.5 text-[#25F4EE] shrink-0" />
          <span className="truncate">{currentOption.description}</span>
        </div>
      </div>
    </div>
  );
};
