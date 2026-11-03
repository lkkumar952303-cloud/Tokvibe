import React, { useState } from 'react';
import { Eye, Heart, Share2, MessageCircle, Bookmark, TrendingUp, Award, ArrowUpRight, BarChart3, Video, Sparkles } from 'lucide-react';
import { VideoItem } from '../types';
import { formatCount } from '../utils/format';
import { audioEngine } from '../utils/audioEngine';

interface ProfileAnalyticsPanelProps {
  userVideos: VideoItem[];
  onSelectVideo: (videoId: string) => void;
  onOpenCreate?: () => void;
}

type SortOption = 'views' | 'likes' | 'shares' | 'recent';

export const ProfileAnalyticsPanel: React.FC<ProfileAnalyticsPanelProps> = ({
  userVideos,
  onSelectVideo,
  onOpenCreate,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('views');

  // Compute aggregate lifetime statistics
  const totalViews = userVideos.reduce(
    (acc, v) => acc + (v.viewsCount ?? Math.max(v.likes * 4.5 + v.sharesCount * 6, 1200)),
    0
  );
  const totalLikes = userVideos.reduce((acc, v) => acc + v.likes, 0);
  const totalShares = userVideos.reduce((acc, v) => acc + v.sharesCount, 0);
  const totalComments = userVideos.reduce((acc, v) => acc + v.commentsCount, 0);

  // Engagement Rate = (Likes + Comments + Shares) / Total Views * 100
  const avgEngagementRate =
    totalViews > 0
      ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1)
      : '0.0';

  // Sort videos according to selected criteria
  const sortedVideos = [...userVideos].sort((a, b) => {
    const aViews = a.viewsCount ?? (a.likes * 4.5);
    const bViews = b.viewsCount ?? (b.likes * 4.5);
    if (sortBy === 'views') return bViews - aViews;
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'shares') return b.sharesCount - a.sharesCount;
    return b.id.localeCompare(a.id); // recent
  });

  const maxViews = Math.max(
    ...userVideos.map((v) => v.viewsCount ?? (v.likes * 4.5)),
    1
  );

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-200">
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#25F4EE]" />
            Creator Performance Studio
          </h3>
          <p className="text-[11px] text-white/50">
            Real-time analytics for your {userVideos.length} uploaded {userVideos.length === 1 ? 'video' : 'videos'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#25F4EE]/10 border border-[#25F4EE]/20 px-2 py-1 rounded-full text-[10px] font-bold text-[#25F4EE]">
          <TrendingUp className="w-3 h-3" />
          <span>+18.4% this week</span>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Views, Likes, Shares) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Total Views Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/60 border border-white/10 rounded-2xl p-3 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-white/50 mb-1">
            <span className="text-[11px] font-semibold">Total Views</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            {formatCount(totalViews)}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" /> +24.6%
          </div>
        </div>

        {/* Total Likes Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/60 border border-white/10 rounded-2xl p-3 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-white/50 mb-1">
            <span className="text-[11px] font-semibold">Total Likes</span>
            <div className="w-6 h-6 rounded-lg bg-[#FE2C55]/10 flex items-center justify-center text-[#FE2C55]">
              <Heart className="w-3.5 h-3.5 fill-[#FE2C55]" />
            </div>
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            {formatCount(totalLikes)}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" /> +15.2%
          </div>
        </div>

        {/* Total Shares Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/60 border border-white/10 rounded-2xl p-3 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-white/50 mb-1">
            <span className="text-[11px] font-semibold">Total Shares</span>
            <div className="w-6 h-6 rounded-lg bg-[#FACE15]/10 flex items-center justify-center text-[#FACE15]">
              <Share2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            {formatCount(totalShares)}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" /> +32.1%
          </div>
        </div>
      </div>

      {/* Secondary Engagement Bar */}
      <div className="bg-zinc-900/70 border border-white/5 rounded-2xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-white font-bold text-xs">Avg. Engagement Rate</div>
            <div className="text-[10px] text-white/50">Industry benchmark: 4.8%</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-[#25F4EE]">{avgEngagementRate}%</span>
          <span className="block text-[10px] text-emerald-400 font-semibold">Very High 🔥</span>
        </div>
      </div>

      {/* Videos Performance Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-white/60" />
            Uploaded Video Performance
          </h4>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-white/10">
            {(
              [
                { id: 'views', label: 'Views' },
                { id: 'likes', label: 'Likes' },
                { id: 'shares', label: 'Shares' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSortBy(opt.id);
                  audioEngine.playHeartPop();
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  sortBy === opt.id
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {userVideos.length === 0 ? (
          <div className="py-12 bg-zinc-900/40 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white/40">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">No Video Analytics Yet</p>
              <p className="text-[11px] text-white/50 max-w-xs mt-0.5">
                Record or upload your first video to start tracking lifetime views, likes, and shares!
              </p>
            </div>
            {onOpenCreate && (
              <button
                onClick={onOpenCreate}
                className="px-4 py-2 rounded-xl bg-[#FE2C55] text-white text-xs font-bold hover:bg-[#e0264b] transition-colors shadow-lg shadow-[#FE2C55]/20"
              >
                Record Video Now
              </button>
            )}
          </div>
        ) : (
          /* Video Performance Cards */
          <div className="space-y-2.5">
            {sortedVideos.map((video, idx) => {
              const views = video.viewsCount ?? Math.max(video.likes * 4.5 + video.sharesCount * 6, 1200);
              const percentage = Math.round((views / maxViews) * 100);
              const isTop = idx === 0 && sortBy === 'views';

              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video.id)}
                  className="group bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 rounded-2xl p-3 flex gap-3 transition-all cursor-pointer shadow-md hover:border-white/20"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-26 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                    <video
                      src={video.videoUrl}
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    {isTop && (
                      <div className="absolute top-1 left-1 bg-[#FACE15] text-black font-extrabold text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5 shadow">
                        <Award className="w-2.5 h-2.5" /> #1
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 text-[9px] font-mono font-bold text-white/90">
                      ▶ {formatCount(views)}
                    </div>
                  </div>

                  {/* Video Metadata & Tally Counts */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#25F4EE] transition-colors">
                          {video.caption || 'Untitled recording'}
                        </p>
                        <span className="text-[10px] text-white/40 shrink-0 font-medium">
                          {video.createdAt}
                        </span>
                      </div>

                      {/* Filter or Tags Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {video.filter && video.filter !== 'normal' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-bold capitalize">
                            ✦ {video.filter}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-white/50 text-[9px]">
                          #{video.category}
                        </span>
                      </div>
                    </div>

                    {/* View Metrics Strip: Views, Likes, Shares */}
                    <div className="space-y-1.5 pt-2">
                      <div className="grid grid-cols-3 gap-1 bg-black/40 border border-white/5 rounded-xl py-1.5 px-2 text-center">
                        {/* Views */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-white/50 flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5 text-blue-400" /> Views
                          </span>
                          <span className="text-xs font-bold text-white">
                            {formatCount(views)}
                          </span>
                        </div>

                        {/* Likes */}
                        <div className="flex flex-col items-center border-x border-white/5">
                          <span className="text-[9px] text-white/50 flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5 text-[#FE2C55] fill-[#FE2C55]" /> Likes
                          </span>
                          <span className="text-xs font-bold text-white">
                            {formatCount(video.likes)}
                          </span>
                        </div>

                        {/* Shares */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-white/50 flex items-center gap-0.5">
                            <Share2 className="w-2.5 h-2.5 text-[#FACE15]" /> Shares
                          </span>
                          <span className="text-xs font-bold text-white">
                            {formatCount(video.sharesCount)}
                          </span>
                        </div>
                      </div>

                      {/* Performance Bar (relative to highest video) */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-white/50 shrink-0 w-8 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
