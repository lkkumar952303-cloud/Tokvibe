import React, { useState } from 'react';
import { X, Play, Pause, Bookmark, Video, Heart } from 'lucide-react';
import { Sound, VideoItem } from '../types';
import { formatCount } from '../utils/format';
import { audioEngine } from '../utils/audioEngine';

interface SoundDetailModalProps {
  sound: Sound;
  isOpen: boolean;
  onClose: () => void;
  onUseSound: (sound: Sound) => void;
  videos: VideoItem[];
  onSelectVideo: (videoId: string) => void;
}

export const SoundDetailModal: React.FC<SoundDetailModalProps> = ({
  sound,
  isOpen,
  onClose,
  onUseSound,
  videos,
  onSelectVideo,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.playSound(sound.beatType);
      setIsPlaying(true);
    }
  };

  const soundVideos = videos.filter((v) => v.sound.id === sound.id || v.sound.beatType === sound.beatType);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between max-w-lg mx-auto overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-md z-20">
        <button
          onClick={() => {
            audioEngine.stop();
            onClose();
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-white/80">Sound Track</span>
        <button
          onClick={() => {
            setIsSaved(!isSaved);
            audioEngine.playHeartPop();
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/80"
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[#FACE15] text-[#FACE15]' : ''}`} />
        </button>
      </div>

      {/* Main Sound Info Card */}
      <div className="p-5 flex flex-col items-center text-center">
        {/* Album Artwork & Play button */}
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl mb-4 group cursor-pointer border border-white/15" onClick={togglePlay}>
          <img
            src={sound.coverUrl}
            alt={sound.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black translate-x-0.5" />
              )}
            </div>
          </div>
        </div>

        <h2 className="text-base font-extrabold text-white max-w-xs">{sound.title}</h2>
        <p className="text-xs text-white/60 mt-1">{sound.artist}</p>
        <p className="text-[11px] text-[#25F4EE] font-bold mt-1">
          {formatCount(sound.useCount)} total videos created
        </p>

        {/* Dynamic Sound Waveform bars */}
        <div className="flex items-center gap-1 my-4 h-8 px-4">
          {[12, 24, 18, 30, 26, 14, 28, 32, 20, 16, 26, 32, 18, 22, 14].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPlaying ? 'bg-[#FE2C55] animate-pulse' : 'bg-white/30'
              }`}
              style={{
                height: isPlaying ? `${Math.max(8, (h * (i % 2 === 0 ? 1.2 : 0.8)))}px` : `${h * 0.7}px`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* Use This Sound CTA */}
        <button
          onClick={() => {
            audioEngine.stop();
            onUseSound(sound);
          }}
          className="w-full max-w-xs py-3 rounded-xl bg-[#FE2C55] hover:bg-[#e0264b] active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FE2C55]/25 transition-all"
        >
          <Video className="w-4 h-4" />
          <span>Use this Sound</span>
        </button>
      </div>

      {/* Videos Using This Sound Grid */}
      <div className="flex-1 px-2 pt-2 border-t border-white/10">
        <h3 className="text-xs font-bold text-white/70 px-2 py-2">
          Videos with this sound
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {soundVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => {
                audioEngine.stop();
                onSelectVideo(video.id);
                onClose();
              }}
              className="relative aspect-9/16 bg-zinc-900 cursor-pointer overflow-hidden group"
            >
              <video
                src={video.videoUrl}
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[10px] font-bold text-white">
                <Heart className="w-3 h-3 fill-white" />
                <span>{formatCount(video.likes)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
