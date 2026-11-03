import React, { useState } from 'react';
import { X, Sliders, Check, Eye } from 'lucide-react';
import { FilterPreset, FilterCategory, FILTER_PRESETS } from '../utils/filterPresets';

interface FilterSelectionOverlayProps {
  selectedFilterId: string;
  onSelectFilter: (filterId: string) => void;
  intensity: number;
  onChangeIntensity: (val: number) => void;
  isOpen: boolean;
  onClose: () => void;
  isComparing: boolean;
  setIsComparing: (val: boolean) => void;
}

export const FilterSelectionOverlay: React.FC<FilterSelectionOverlayProps> = ({
  selectedFilterId,
  onSelectFilter,
  intensity,
  onChangeIntensity,
  isOpen,
  onClose,
  isComparing,
  setIsComparing,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  if (!isOpen) return null;

  const currentPreset = FILTER_PRESETS.find((f) => f.id === selectedFilterId) || FILTER_PRESETS[0];

  const filteredPresets = FILTER_PRESETS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black via-zinc-950/95 to-transparent pt-12 pb-6 px-4 animate-in slide-in-from-bottom duration-200 select-none">
      {/* Top Header Bar inside Overlay */}
      <div className="flex items-center justify-between mb-3 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FE2C55]" />
            Color Grade Filters
          </span>
          {selectedFilterId !== 'normal' && (
            <span className="text-[11px] font-semibold text-[#25F4EE]">
              · {currentPreset.name} ({intensity}%)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Compare Button (Hold to view original) */}
          {selectedFilterId !== 'normal' && (
            <button
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={() => setIsComparing(false)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                isComparing
                  ? 'bg-white text-black border-white'
                  : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/80'
              }`}
              title="Hold to see original without filter"
            >
              <Eye className="w-3 h-3" />
              <span>{isComparing ? 'Original' : 'Hold Compare'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Time Intensity Slider (Only when a filter is applied) */}
      {selectedFilterId !== 'normal' && (
        <div className="max-w-md mx-auto mb-4 bg-black/60 backdrop-blur-md rounded-2xl p-2.5 px-4 border border-white/10 flex items-center gap-3">
          <Sliders className="w-3.5 h-3.5 text-[#25F4EE] shrink-0" />
          <div className="flex-1 flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="100"
              value={intensity}
              onChange={(e) => onChangeIntensity(Number(e.target.value))}
              className="w-full accent-[#FE2C55] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-white w-9 text-right shrink-0">
              {intensity}%
            </span>
          </div>
          <button
            onClick={() => onChangeIntensity(85)}
            className="text-[10px] text-white/50 hover:text-white underline shrink-0"
          >
            Reset
          </button>
        </div>
      )}

      {/* Filter Category Filter Tabs */}
      <div className="flex items-center gap-1.5 max-w-md mx-auto overflow-x-auto no-scrollbar pb-2 mb-2">
        {[
          { id: 'all', label: 'All Presets' },
          { id: 'cinematic', label: 'Cinematic' },
          { id: 'aesthetic', label: 'Aesthetic' },
          { id: 'vintage', label: 'Vintage Film' },
          { id: 'moody', label: 'Moody' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as FilterCategory)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === tab.id
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Real-Time Filter Presets Carousel */}
      <div className="max-w-md mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {filteredPresets.map((preset: FilterPreset) => {
          const isSelected = selectedFilterId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                onSelectFilter(preset.id);
                if (preset.id !== 'normal' && intensity === 0) {
                  onChangeIntensity(85);
                }
              }}
              className={`flex flex-col items-center gap-1.5 shrink-0 group transition-all p-1 rounded-xl ${
                isSelected ? 'scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {/* Swatch Circle */}
              <div
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                  isSelected
                    ? 'ring-2 ring-[#FE2C55] ring-offset-2 ring-offset-black scale-105'
                    : 'border border-white/20 group-hover:scale-102'
                }`}
                style={{ background: preset.gradientSwatch }}
              >
                {/* Active checkmark */}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Preset Labels */}
              <div className="text-center w-16">
                <p
                  className={`text-[11px] truncate leading-tight ${
                    isSelected ? 'font-bold text-white' : 'font-medium text-white/70'
                  }`}
                >
                  {preset.name}
                </p>
                <p className="text-[9px] text-white/40 truncate leading-tight mt-0.5">
                  {preset.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
