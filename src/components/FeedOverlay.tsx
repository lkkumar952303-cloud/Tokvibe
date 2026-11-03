import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Music2, Plus, Check, Mic, ChevronLeft } from 'lucide-react';
import { VideoItem, Creator } from '../types';
import { formatCount } from '../utils/format';
import { audioEngine } from '../utils/audioEngine';

interface FeedOverlayProps {
  video: VideoItem;
  isPlaying: boolean;
  isFollowing: boolean;
  onToggleFollow: (creatorId: string) => void;
  onToggleLike: (videoId: string) => void;
  onOpenComments: () => void;
  onToggleBookmark: (videoId: string) => void;
  onOpenShare: () => void;
  onSelectCreator: (creator: Creator) => void;
  onSelectSound: () => void;
  progress: number;
  onSeek: (percent: number) => void;
}

export const FeedOverlay: React.FC<FeedOverlayProps> = ({
  video,
  isPlaying,
  isFollowing,
  onToggleFollow,
  onToggleLike,
  onOpenComments,
  onToggleBookmark,
  onOpenShare,
  onSelectCreator,
  onSelectSound,
  progress,
  onSeek,
}) => {
  const [likeAnim, setLikeAnim] = useState(false);
  const [followSuccess, setFollowSuccess] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikeAnim(true);
    audioEngine.playHeartPop();
    onToggleLike(video.id);
    setTimeout(() => setLikeAnim(false), 400);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowSuccess(true);
    audioEngine.playFollowCheer();
    onToggleFollow(video.creator.id);
    setTimeout(() => setFollowSuccess(false), 800);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percent);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pb-16 z-20 select-none">
      {/* Top Scrim Gradient */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Bottom Scrim Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      {/* Top Bar Space (handled in main App) */}
      <div className="relative z-10" />

      {/* Subtle Right Edge Swipe Left Indicator for Creator Profile */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectCreator(video.creator);
          }}
          title={`Swipe left to view @${video.creator.username}'s profile`}
          className="flex items-center gap-0.5 py-2.5 px-1 rounded-l-md bg-black/25 hover:bg-black/60 backdrop-blur-sm border-l border-y border-white/10 text-white/40 hover:text-white transition-all group active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex items-end justify-between gap-4 mt-auto">
        {/* Left Creator Info & Caption */}
        <div className="flex-1 max-w-[80%] space-y-2 pointer-events-auto text-left">
          {/* Creator Tag & Verified */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectCreator(video.creator)}
              className="text-base font-bold text-white hover:underline flex items-center gap-1.5 shadow-sm drop-shadow"
            >
              <span>@{video.creator.username}</span>
              {video.creator.verified && (
                <span className="w-4 h-4 rounded-full bg-[#20D5EC] flex items-center justify-center text-[10px] text-black font-extrabold">
                  ✓
                </span>
              )}
            </button>
            <span className="text-white/60 text-xs">· {video.createdAt}</span>
          </div>

          {/* Caption */}
          <p className="text-sm text-white/95 leading-snug drop-shadow line-clamp-3">
            {video.caption}
          </p>

          {/* Music Ticker & Voiceover Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onSelectSound}
              className="flex items-center gap-2 text-xs text-white/90 font-medium py-1 px-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all max-w-full truncate group"
            >
              <Music2 className="w-3.5 h-3.5 text-[#25F4EE] shrink-0 animate-pulse" />
              <div className="overflow-hidden whitespace-nowrap">
                <span className="inline-block group-hover:translate-x-1 transition-transform">
                  ♫ {video.sound.title} - {video.sound.artist}
                </span>
              </div>
            </button>
            {video.voiceoverUrl && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90 py-1 px-2 rounded-full bg-[#FE2C55]/30 border border-[#FE2C55]/40 backdrop-blur-md">
                <Mic className="w-3 h-3 text-[#FE2C55]" />
                <span>Voiceover</span>
              </div>
            )}
            {video.transition && video.transition !== 'none' && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-200 py-1 px-2 rounded-full bg-purple-600/30 border border-purple-500/40 backdrop-blur-md capitalize">
                <span>⚡ {video.transition} Cut</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Sidebar (Vertical TikTok Icons) */}
        <div className="flex flex-col items-center gap-4 pointer-events-auto shrink-0 pb-2">
          {/* Creator Avatar with Follow Plus Badge */}
          <div className="relative mb-2">
            <button
              onClick={() => onSelectCreator(video.creator)}
              className="w-12 h-12 rounded-full border-2 border-white overflow-hidden p-0.5 bg-black/50 shadow-lg active:scale-95 transition-transform"
            >
              <img
                src={video.creator.avatar}
                alt={video.creator.displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
            </button>
            {!isFollowing && (
              <button
                onClick={handleFollowClick}
                title="Follow creator"
                className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center shadow-md transition-all ${
                  followSuccess ? 'scale-125 bg-emerald-500' : 'hover:scale-110 active:scale-95'
                }`}
              >
                {followSuccess ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            )}
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLikeClick}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform ${
                likeAnim ? 'scale-135' : 'hover:scale-110 active:scale-90'
              }`}
            >
              <Heart
                className={`w-8 h-8 filter drop-shadow-md transition-colors ${
                  video.isLiked
                    ? 'fill-[#FE2C55] text-[#FE2C55]'
                    : 'text-white fill-black/30 stroke-[2]'
                }`}
              />
            </button>
            <span className="text-[11px] font-semibold text-white drop-shadow">
              {formatCount(video.likes)}
            </span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments();
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
            >
              <MessageCircle className="w-8 h-8 text-white fill-black/30 stroke-[2] drop-shadow-md" />
            </button>
            <span className="text-[11px] font-semibold text-white drop-shadow">
              {formatCount(video.commentsCount)}
            </span>
          </div>

          {/* Bookmark Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(video.id);
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
            >
              <Bookmark
                className={`w-8 h-8 filter drop-shadow-md transition-colors ${
                  video.isBookmarked
                    ? 'fill-[#FACE15] text-[#FACE15]'
                    : 'text-white fill-black/30 stroke-[2]'
                }`}
              />
            </button>
            <span className="text-[11px] font-semibold text-white drop-shadow">
              {formatCount(video.bookmarksCount)}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenShare();
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
            >
              <Share2 className="w-7 h-7 text-white fill-black/30 stroke-[2.2] drop-shadow-md" />
            </button>
            <span className="text-[11px] font-semibold text-white drop-shadow">
              {formatCount(video.sharesCount)}
            </span>
          </div>

          {/* Rotating Vinyl Disc with Sound Cover */}
          <div className="relative mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSound();
              }}
              className={`w-11 h-11 rounded-full p-2 bg-gradient-to-tr from-slate-900 to-black border-2 border-white/80 shadow-xl flex items-center justify-center ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            >
              <img
                src={video.sound.coverUrl}
                alt="Sound cover"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
            </button>
            {/* Floating Music Notes Animation */}
            {isPlaying && (
              <div className="absolute -top-3 -left-3 pointer-events-none">
                <span className="absolute animate-float-note text-white/90 text-sm font-bold">♪</span>
                <span className="absolute animate-float-note text-[#25F4EE] text-xs font-bold" style={{ animationDelay: '0.8s' }}>♫</span>
                <span className="absolute animate-float-note text-[#FE2C55] text-sm font-bold" style={{ animationDelay: '1.6s' }}>♩</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline Scrubber */}
      <div
        onClick={handleProgressBarClick}
        className="absolute bottom-0 left-0 right-0 h-2 bg-white/20 hover:h-3 cursor-pointer pointer-events-auto transition-all group z-30"
      >
        <div
          className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] relative transition-all"
          style={{ width: `${progress * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
