import React, { useState } from 'react';
import { Search, Flame, Music, Play, Check, Plus, Hash } from 'lucide-react';
import { VideoItem, Creator, Sound } from '../types';
import { formatCount } from '../utils/format';
import { MOCK_SOUNDS, MOCK_CREATORS } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface DiscoverViewProps {
  videos: VideoItem[];
  onSelectVideo: (videoId: string) => void;
  onSelectCreator: (creator: Creator) => void;
  onSelectSound: (sound: Sound) => void;
  onToggleFollow: (creatorId: string) => void;
  followingIds: string[];
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  videos,
  onSelectVideo,
  onSelectCreator,
  onSelectSound,
  onToggleFollow,
  followingIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const trendingTags = [
    { name: 'dance', views: '14.2B' },
    { name: 'comedy', views: '9.8B' },
    { name: 'streetfood', views: '6.4B' },
    { name: 'viral', views: '22.1B' },
    { name: 'bollywood', views: '11.5B' },
    { name: 'art', views: '4.7B' },
  ];

  const filteredVideos = videos.filter((v) => {
    if (selectedTag) {
      return v.tags.includes(selectedTag);
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.caption.toLowerCase().includes(q) ||
      v.creator.username.toLowerCase().includes(q) ||
      v.creator.displayName.toLowerCase().includes(q) ||
      v.sound.title.toLowerCase().includes(q) ||
      v.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full h-full bg-black text-white overflow-y-auto pb-24 pt-4 px-4 max-w-2xl mx-auto no-scrollbar">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 pb-3 bg-black/90 backdrop-blur-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-white/50 absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedTag(null);
            }}
            placeholder="Search creators, sounds, hashtags..."
            className="w-full bg-zinc-900 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-white/60 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Trending Hashtags Horizontal Strip */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-white/80">
          <Flame className="w-4 h-4 text-[#FE2C55]" />
          <span>Trending Hashtags</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {trendingTags.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                setSelectedTag(selectedTag === t.name ? null : t.name);
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedTag === t.name
                  ? 'bg-[#FE2C55] text-white'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white/80 border border-white/10'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>#{t.name}</span>
              <span className="text-[10px] text-white/50">({t.views})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Sounds Section */}
      {!searchQuery && !selectedTag && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
              <Music className="w-4 h-4 text-[#25F4EE]" />
              <span>Viral Sounds</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_SOUNDS.slice(0, 4).map((sound) => (
              <div
                key={sound.id}
                onClick={() => onSelectSound(sound)}
                className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-white/20 cursor-pointer transition-colors group"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={sound.coverUrl}
                    alt={sound.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{sound.title}</p>
                  <p className="text-[11px] text-white/50 truncate">{sound.artist}</p>
                  <p className="text-[10px] text-[#25F4EE] mt-0.5">
                    {formatCount(sound.useCount)} videos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Popular Creators */}
      {!searchQuery && !selectedTag && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-white/80">
            <span>Creators for you</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {Object.values(MOCK_CREATORS).map((creator) => {
              const isFollowing = followingIds.includes(creator.id);
              return (
                <div
                  key={creator.id}
                  className="w-32 bg-zinc-900 rounded-xl p-3 flex flex-col items-center text-center shrink-0 border border-white/5"
                >
                  <img
                    src={creator.avatar}
                    alt={creator.displayName}
                    referrerPolicy="no-referrer"
                    onClick={() => onSelectCreator(creator)}
                    className="w-14 h-14 rounded-full object-cover mb-2 cursor-pointer hover:scale-105 transition-transform"
                  />
                  <p
                    onClick={() => onSelectCreator(creator)}
                    className="text-xs font-bold text-white truncate w-full cursor-pointer hover:underline"
                  >
                    {creator.displayName}
                  </p>
                  <p className="text-[10px] text-white/50 truncate w-full mb-2">
                    @{creator.username}
                  </p>
                  <button
                    onClick={() => {
                      onToggleFollow(creator.id);
                      audioEngine.playFollowCheer();
                    }}
                    className={`w-full py-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${
                      isFollowing
                        ? 'bg-white/10 text-white/80'
                        : 'bg-[#FE2C55] text-white hover:bg-[#e0264b]'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3" /> Following
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> Follow
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Grid Feed */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-white/80">
          <span>{selectedTag ? `#${selectedTag} Videos` : 'Trending Feeds'}</span>
          <span className="text-white/40">{filteredVideos.length} videos</span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-xs">
            No videos found for "{searchQuery || selectedTag}"
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video.id)}
                className="relative aspect-9/16 rounded-xl overflow-hidden bg-zinc-900 cursor-pointer group shadow-md"
              >
                {/* Video / Thumbnail preview */}
                <video
                  src={video.videoUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* View count tag on bottom */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                  <div className="flex items-center gap-1 font-semibold">
                    <Play className="w-3 h-3 fill-white" />
                    <span>{formatCount(video.likes)}</span>
                  </div>
                  <span className="text-[10px] text-white/70 truncate max-w-[70px]">
                    @{video.creator.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
