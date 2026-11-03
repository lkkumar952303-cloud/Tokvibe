import React, { useState } from 'react';
import { X, Search, Sparkles, MessageSquare, Clock, MapPin, AtSign, Hash, Check, Type, Heart } from 'lucide-react';
import { PlacedSticker } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface StickerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: Omit<PlacedSticker, 'id' | 'x' | 'y'>) => void;
}

const TRENDING_EMOJIS = [
  '🔥', '💯', '👑', '✨', '⚡', '💖', '🚀', '🍿', '💥', '🤙', 
  '🎯', '🤩', '💃', '🍕', '🎧', '🕶️', '🌶️', '💸', '🇮🇳', '🏆',
  '😂', '🥰', '😎', '🤯', '🥳', '🥺', '💀', '🥶', '🥵', '🤤',
  '👏', '🙌', '🎉', '🌟', '💎', '🌈', '🍦', '🍔', '🥂', '🎤'
];

interface InteractiveBadgePreset {
  id: string;
  type: 'badge';
  title: string;
  subText?: string;
  icon: 'poll' | 'question' | 'clock' | 'location' | 'mention' | 'hashtag' | 'music';
  color: string;
  bgColor: string;
}

const INTERACTIVE_BADGES: InteractiveBadgePreset[] = [
  {
    id: 'b_poll',
    type: 'badge',
    title: 'POLL: Rate this vibe! 🗳️',
    subText: 'Tap to Vote (Yes / No)',
    icon: 'poll',
    color: '#FFFFFF',
    bgColor: 'linear-gradient(135deg, #FE2C55 0%, #FF0050 100%)',
  },
  {
    id: 'b_question',
    type: 'badge',
    title: 'Ask me a question 💬',
    subText: 'Type answer in comments...',
    icon: 'question',
    color: '#000000',
    bgColor: '#FFFFFF',
  },
  {
    id: 'b_clock',
    type: 'badge',
    title: 'CURRENT TIME ⏰',
    subText: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    icon: 'clock',
    color: '#FFFFFF',
    bgColor: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
  },
  {
    id: 'b_location',
    type: 'badge',
    title: '📍 Mumbai, India',
    subText: 'Marine Drive Vibe',
    icon: 'location',
    color: '#FFFFFF',
    bgColor: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
  },
  {
    id: 'b_mention',
    type: 'badge',
    title: '@tokvibe_star',
    subText: 'Creator tag',
    icon: 'mention',
    color: '#000000',
    bgColor: '#25F4EE',
  },
  {
    id: 'b_hashtag',
    type: 'badge',
    title: '#DesiDanceChallenge',
    subText: 'Trending 2.4M',
    icon: 'hashtag',
    color: '#FFFFFF',
    bgColor: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
  },
];

const DESI_VIBES = [
  { text: '🔥 Bawaal!', bg: '#FE2C55', color: '#FFFFFF' },
  { text: '💯 Ek Number', bg: '#FACE15', color: '#000000' },
  { text: '⚡ Dhamaka!', bg: '#25F4EE', color: '#000000' },
  { text: '🕺 Machao!', bg: '#A855F7', color: '#FFFFFF' },
  { text: '✨ Shandar', bg: '#F43F5E', color: '#FFFFFF' },
  { text: '🤙 Mauj Kardi', bg: '#10B981', color: '#FFFFFF' },
  { text: '👑 Desi Swag', bg: '#F59E0B', color: '#000000' },
  { text: '👀 Dekhte Raho', bg: '#3B82F6', color: '#FFFFFF' },
];

export const StickerPickerModal: React.FC<StickerPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'interactive' | 'desi' | 'custom'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom text sticker creator state
  const [customText, setCustomText] = useState('🔥 VIBE CHECK');
  const [customBgColor, setCustomBgColor] = useState('#FE2C55');
  const [customTextColor, setCustomTextColor] = useState('#FFFFFF');

  if (!isOpen) return null;

  const filteredEmojis = searchQuery.trim()
    ? TRENDING_EMOJIS.filter(() => true) // All available emojis
    : TRENDING_EMOJIS;

  const handleSelectEmoji = (emoji: string) => {
    audioEngine.playHeartPop();
    onSelectSticker({
      type: 'emoji',
      content: emoji,
      scale: 1.2,
      rotation: 0,
    });
    onClose();
  };

  const handleSelectBadge = (badge: InteractiveBadgePreset) => {
    audioEngine.playFollowCheer();
    onSelectSticker({
      type: 'badge',
      content: badge.title,
      subText: badge.subText,
      scale: 1,
      rotation: 0,
      color: badge.color,
      bgColor: badge.bgColor,
    });
    onClose();
  };

  const handleSelectDesi = (vibe: { text: string; bg: string; color: string }) => {
    audioEngine.playFollowCheer();
    onSelectSticker({
      type: 'badge',
      content: vibe.text,
      scale: 1.1,
      rotation: -3,
      color: vibe.color,
      bgColor: vibe.bg,
    });
    onClose();
  };

  const handleAddCustomText = () => {
    if (!customText.trim()) return;
    audioEngine.playHeartPop();
    onSelectSticker({
      type: 'custom_text',
      content: customText.trim(),
      scale: 1.1,
      rotation: 0,
      color: customTextColor,
      bgColor: customBgColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg mx-auto bg-[#141417] rounded-t-3xl border-t border-white/10 max-h-[82vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Handle bar */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FACE15]" />
            <h3 className="text-sm font-bold text-white">Stickers & Emojis</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'trending', label: '🔥 Emojis', icon: Sparkles },
            { id: 'interactive', label: '🗳️ Badges', icon: MessageSquare },
            { id: 'desi', label: '⚡ Desi Vibes', icon: Heart },
            { id: 'custom', label: '✏️ Custom Text', icon: Type },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#FE2C55] text-white shadow-md shadow-[#FE2C55]/30'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Trending Emojis */}
        {activeTab === 'trending' && (
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
            <p className="text-xs text-white/50 mb-3 font-medium">Tap any emoji to drop onto video canvas:</p>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
              {filteredEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 flex items-center justify-center text-3xl active:scale-90 transition-transform shadow-sm"
                >
                  <span>{emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Badges */}
        {activeTab === 'interactive' && (
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-3">
            <p className="text-xs text-white/50 mb-1 font-medium">
              TikTok-style interactive overlays (drag & place anywhere):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTERACTIVE_BADGES.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleSelectBadge(badge)}
                  className="p-3 rounded-2xl border border-white/10 flex items-start gap-3 text-left hover:scale-[1.02] active:scale-95 transition-all shadow-md group"
                  style={{ background: badge.bgColor }}
                >
                  <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                    {badge.icon === 'poll' && <MessageSquare className="w-4 h-4 text-white" />}
                    {badge.icon === 'question' && <MessageSquare className="w-4 h-4 text-black" />}
                    {badge.icon === 'clock' && <Clock className="w-4 h-4 text-white" />}
                    {badge.icon === 'location' && <MapPin className="w-4 h-4 text-white" />}
                    {badge.icon === 'mention' && <AtSign className="w-4 h-4 text-black" />}
                    {badge.icon === 'hashtag' && <Hash className="w-4 h-4 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-black drop-shadow-sm truncate"
                      style={{ color: badge.color }}
                    >
                      {badge.title}
                    </p>
                    {badge.subText && (
                      <p
                        className="text-[10px] font-medium opacity-85 truncate"
                        style={{ color: badge.color }}
                      >
                        {badge.subText}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Desi Vibes */}
        {activeTab === 'desi' && (
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
            <p className="text-xs text-white/50 mb-3 font-medium">Punchy Desi stickers & reactions:</p>
            <div className="grid grid-cols-2 gap-2.5">
              {DESI_VIBES.map((vibe, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectDesi(vibe)}
                  className="py-3 px-4 rounded-2xl font-black text-sm tracking-wide text-center active:scale-95 transition-transform shadow-lg border border-white/10 hover:brightness-110"
                  style={{ backgroundColor: vibe.bg, color: vibe.color }}
                >
                  {vibe.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Custom Text Sticker */}
        {activeTab === 'custom' && (
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Custom Sticker Text:
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your sticker text..."
                maxLength={30}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FE2C55]"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Sticker Background Color:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { bg: '#FE2C55', text: '#FFFFFF', name: 'Pink' },
                  { bg: '#25F4EE', text: '#000000', name: 'Cyan' },
                  { bg: '#FACE15', text: '#000000', name: 'Yellow' },
                  { bg: '#9333EA', text: '#FFFFFF', name: 'Purple' },
                  { bg: '#10B981', text: '#FFFFFF', name: 'Emerald' },
                  { bg: '#000000', text: '#FFFFFF', name: 'Black' },
                  { bg: '#FFFFFF', text: '#000000', name: 'White' },
                ].map((c) => (
                  <button
                    key={c.bg}
                    onClick={() => {
                      setCustomBgColor(c.bg);
                      setCustomTextColor(c.text);
                    }}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform active:scale-90 ${
                      customBgColor === c.bg ? 'scale-110 ring-2 ring-white border-transparent' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c.bg }}
                  >
                    {customBgColor === c.bg && (
                      <Check className="w-4 h-4" style={{ color: c.text }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Preview on Canvas:
              </label>
              <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                <div
                  className="px-4 py-2 rounded-xl text-base font-black shadow-xl"
                  style={{ backgroundColor: customBgColor, color: customTextColor }}
                >
                  {customText.trim() || 'Your Text Here'}
                </div>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddCustomText}
              disabled={!customText.trim()}
              className="w-full py-3 rounded-xl bg-[#FE2C55] hover:bg-[#e0264b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FE2C55]/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Place on Video Canvas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
