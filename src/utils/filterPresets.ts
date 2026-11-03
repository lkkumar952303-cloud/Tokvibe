import React from 'react';

export type FilterCategory = 'all' | 'cinematic' | 'aesthetic' | 'vintage' | 'moody';

export interface FilterPreset {
  id: string;
  name: string;
  subtitle: string;
  category: FilterCategory;
  gradientSwatch: string;
  iconSymbol?: string;
  overlayType?: 'vhs' | 'grain' | 'vignette' | 'teal_orange_wash' | 'golden_bloom' | 'cyberpunk_glow';
  getStyle: (intensity: number) => React.CSSProperties;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Normal',
    subtitle: 'Original Natural',
    category: 'all',
    gradientSwatch: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
    getStyle: () => ({}),
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    subtitle: 'Monochrome B&W',
    category: 'cinematic',
    gradientSwatch: 'linear-gradient(135deg, #e2e8f0 0%, #0f172a 100%)',
    overlayType: 'vignette',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const grayscale = factor * 100;
      const contrast = 100 + factor * 35;
      return {
        filter: `grayscale(${grayscale}%) contrast(${contrast}%)`,
      };
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    subtitle: 'Warm Antique Tone',
    category: 'vintage',
    gradientSwatch: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
    overlayType: 'grain',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const sepia = factor * 85;
      const contrast = 100 + factor * 15;
      const saturate = 100 + factor * 20;
      return {
        filter: `sepia(${sepia}%) contrast(${contrast}%) saturate(${saturate}%)`,
      };
    },
  },
  {
    id: 'vivid',
    name: 'Vivid',
    subtitle: 'Punchy & Saturated',
    category: 'aesthetic',
    gradientSwatch: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const saturate = 100 + factor * 80;
      const contrast = 100 + factor * 25;
      const brightness = 100 + factor * 6;
      return {
        filter: `saturate(${saturate}%) contrast(${contrast}%) brightness(${brightness}%)`,
      };
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    subtitle: '80s Nostalgia Film',
    category: 'vintage',
    gradientSwatch: 'linear-gradient(135deg, #ea580c 0%, #4f46e5 100%)',
    overlayType: 'vhs',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const sepia = factor * 30;
      const contrast = 100 + factor * 20;
      const saturate = 100 + factor * 35;
      const hue = factor * -8;
      return {
        filter: `sepia(${sepia}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg)`,
      };
    },
  },
  {
    id: 'teal_orange',
    name: 'Teal & Orange',
    subtitle: 'Hollywood Blockbuster',
    category: 'cinematic',
    gradientSwatch: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
    overlayType: 'teal_orange_wash',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const contrast = 100 + factor * 25;
      const saturate = 100 + factor * 35;
      const hue = factor * -12;
      return {
        filter: `contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg)`,
      };
    },
  },
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk',
    subtitle: 'Electric Neon Glow',
    category: 'aesthetic',
    gradientSwatch: 'linear-gradient(135deg, #06b6d4 0%, #ec4899 100%)',
    overlayType: 'cyberpunk_glow',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const contrast = 100 + factor * 30;
      const saturate = 100 + factor * 70;
      const hue = factor * 280;
      return {
        filter: `contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg)`,
      };
    },
  },
  {
    id: 'vintage_vhs',
    name: 'VHS 1995',
    subtitle: 'Retro Camcorder',
    category: 'vintage',
    gradientSwatch: 'linear-gradient(135deg, #b45309 0%, #0369a1 100%)',
    overlayType: 'vhs',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const contrast = 100 + factor * 25;
      const saturate = 100 + factor * 30;
      const sepia = factor * 25;
      return {
        filter: `contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%)`,
      };
    },
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    subtitle: 'Sunset Amber Bloom',
    category: 'aesthetic',
    gradientSwatch: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    overlayType: 'golden_bloom',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const brightness = 100 + factor * 8;
      const sepia = factor * 38;
      const saturate = 100 + factor * 45;
      return {
        filter: `brightness(${brightness}%) sepia(${sepia}%) saturate(${saturate}%)`,
      };
    },
  },
  {
    id: 'portra_film',
    name: 'Kodak Portra',
    subtitle: 'Analog Color Film',
    category: 'vintage',
    gradientSwatch: 'linear-gradient(135deg, #d97706 0%, #78716c 100%)',
    overlayType: 'grain',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const contrast = 100 + factor * 15;
      const brightness = 100 + factor * 6;
      const saturate = 100 + factor * 20;
      const sepia = factor * 18;
      return {
        filter: `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturate}%) sepia(${sepia}%)`,
      };
    },
  },
  {
    id: 'noir_film',
    name: 'Film Noir',
    subtitle: 'High-Contrast B&W',
    category: 'cinematic',
    gradientSwatch: 'linear-gradient(135deg, #ffffff 0%, #000000 100%)',
    overlayType: 'vignette',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const grayscale = factor * 100;
      const contrast = 100 + factor * 50;
      return {
        filter: `grayscale(${grayscale}%) contrast(${contrast}%)`,
      };
    },
  },
  {
    id: 'emerald_mood',
    name: 'Emerald Mood',
    subtitle: 'Nordic Deep Greens',
    category: 'moody',
    gradientSwatch: 'linear-gradient(135deg, #059669 0%, #0f172a 100%)',
    overlayType: 'vignette',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const contrast = 100 + factor * 25;
      const saturate = 100 - factor * 15;
      const hue = factor * 35;
      return {
        filter: `contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg)`,
      };
    },
  },
  {
    id: 'blush_glamour',
    name: 'Blush Glam',
    subtitle: 'Soft Beauty Glow',
    category: 'aesthetic',
    gradientSwatch: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const brightness = 100 + factor * 12;
      const contrast = 100 + factor * 8;
      const saturate = 100 + factor * 20;
      return {
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
      };
    },
  },
  {
    id: 'retro_sepia',
    name: '1970s Archive',
    subtitle: 'Warm Nostalgia',
    category: 'vintage',
    gradientSwatch: 'linear-gradient(135deg, #854d0e 0%, #451a03 100%)',
    overlayType: 'grain',
    getStyle: (intensity) => {
      const factor = intensity / 100;
      const sepia = factor * 70;
      const contrast = 100 + factor * 18;
      const saturate = 100 + factor * 10;
      return {
        filter: `sepia(${sepia}%) contrast(${contrast}%) saturate(${saturate}%)`,
      };
    },
  },
];
