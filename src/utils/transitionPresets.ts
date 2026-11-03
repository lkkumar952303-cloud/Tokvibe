import { TransitionType } from '../types';

export interface TransitionPreset {
  id: TransitionType;
  name: string;
  subtitle: string;
  description: string;
  badgeColor: string;
  previewClass: string;
}

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: 'none',
    name: 'Cut',
    subtitle: 'Standard',
    description: 'Instant direct cut between clips without animation',
    badgeColor: 'bg-zinc-700 text-zinc-200',
    previewClass: 'transition-cut',
  },
  {
    id: 'fade',
    name: 'Fade',
    subtitle: 'Dissolve',
    description: 'Smooth cinematic cross-dissolve between segments',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    previewClass: 'transition-fade',
  },
  {
    id: 'slide',
    name: 'Slide',
    subtitle: 'Kinetic Push',
    description: 'Energetic horizontal push moving from Take 1 into Take 2',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    previewClass: 'transition-slide',
  },
  {
    id: 'wipe',
    name: 'Wipe',
    subtitle: 'Sweep Wipe',
    description: 'Diagonal clip-path sweep uncovering the next scene',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    previewClass: 'transition-wipe',
  },
  {
    id: 'zoom',
    name: 'Zoom Punch',
    subtitle: 'Fast Snap',
    description: 'Dynamic zoom-in blur transition with rapid punch',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    previewClass: 'transition-zoom',
  },
  {
    id: 'flash',
    name: 'White Flash',
    subtitle: 'Strobe Pop',
    description: 'High-energy white exposure flash impact between takes',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    previewClass: 'transition-flash',
  },
  {
    id: 'glitch',
    name: 'RGB Glitch',
    subtitle: 'Cyber Slice',
    description: 'Retro digital aberration and horizontal scan slice cut',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    previewClass: 'transition-glitch',
  },
];
