import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Edit3, Grid, Heart, Bookmark, Share2, Check, UserPlus, MessageSquare, BarChart3 } from 'lucide-react';
import { Creator, VideoItem } from '../types';
import { formatCount } from '../utils/format';
import { CURRENT_USER } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';
import { ProfileAnalyticsPanel } from './ProfileAnalyticsPanel';

interface ProfileViewProps {
  creator: Creator;
  isCurrentUser: boolean;
  isFollowing: boolean;
  onToggleFollow: (creatorId: string) => void;
  onBack?: () => void;
  videos: VideoItem[];
  onSelectVideo: (videoId: string) => void;
  onOpenMessages?: (creatorUsername: string) => void;
  onUpdateProfile?: (updated: Partial<Creator>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  creator,
  isCurrentUser,
  isFollowing,
  onToggleFollow,
  onBack,
  videos,
  onSelectVideo,
  onOpenMessages,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'saved' | 'analytics'>('videos');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(creator.displayName);
  const [editBio, setEditBio] = useState(creator.bio);

  // Swipe right gesture to return to feed (symmetric to feed's swipe left)
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!onBack) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    // Swiped right -> return to feed
    if (diffX < -55 && Math.abs(diffX) > Math.abs(diffY) * 1.25) {
      audioEngine.playHeartPop();
      onBack();
    }
  };

  useEffect(() => {
    if (!onBack) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'ArrowRight') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  // Filter videos for this user
  const userVideos = videos.filter((v) =>
    isCurrentUser ? v.creator.id === CURRENT_USER.id : v.creator.id === creator.id
  );
  const likedVideos = videos.filter((v) => v.isLiked);
  const savedVideos = videos.filter((v) => v.isBookmarked);

  const displayedVideos =
    activeTab === 'videos'
      ? userVideos
      : activeTab === 'liked'
      ? likedVideos
      : savedVideos;

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        displayName: editName,
        bio: editBio,
      });
    }
    setIsEditing(false);
    audioEngine.playHeartPop();
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full bg-black text-white flex flex-col max-w-lg mx-auto overflow-y-auto pb-24 no-scrollbar select-none"
    >
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-black/90 backdrop-blur-md border-b border-white/10">
        {onBack ? (
          <div className="flex items-center gap-1">
            <button
              onClick={onBack}
              title="Return to feed (or swipe right / →)"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] text-white/40 hidden sm:inline">Feed</span>
          </div>
        ) : (
          <div className="w-8" />
        )}
        <h3 className="text-sm font-bold truncate max-w-[200px]">
          @{creator.username}
        </h3>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            audioEngine.playHeartPop();
          }}
          title="Share profile"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Header Details */}
      <div className="flex flex-col items-center px-4 pt-4 pb-2">
        {/* Avatar with Story gradient border */}
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#25F4EE] via-[#FE2C55] to-[#FACE15] shadow-xl">
            <img
              src={creator.avatar}
              alt={creator.displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover bg-zinc-900 border-2 border-black"
            />
          </div>
        </div>

        {/* Display Name & Verified */}
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-base font-extrabold text-white">{creator.displayName}</h2>
          {creator.verified && (
            <span className="w-4 h-4 rounded-full bg-[#20D5EC] flex items-center justify-center text-[10px] text-black font-extrabold">
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-white/50 mb-4">@{creator.username}</p>

        {/* Numeric Tally: Following, Followers, Likes */}
        <div className="flex items-center justify-center gap-8 mb-5 py-2 px-6 rounded-2xl bg-zinc-900/40 border border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">
              {formatCount(creator.following)}
            </span>
            <span className="text-[11px] text-white/50">Following</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">
              {formatCount(creator.followers + (isFollowing ? 1 : 0))}
            </span>
            <span className="text-[11px] text-white/50">Followers</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">
              {formatCount(creator.totalLikes)}
            </span>
            <span className="text-[11px] text-white/50">Likes</span>
          </div>
        </div>

        {/* Action Buttons: Edit Profile or Follow/Message */}
        <div className="flex items-center gap-2 w-full max-w-xs mb-4">
          {isCurrentUser ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  audioEngine.playHeartPop();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                  activeTab === 'analytics'
                    ? 'bg-[#25F4EE]/20 border-[#25F4EE] text-[#25F4EE]'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/10'
                }`}
                title="View Creator Analytics"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#25F4EE]" />
                <span>Analytics</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onToggleFollow(creator.id);
                  audioEngine.playFollowCheer();
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  isFollowing
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'bg-[#FE2C55] text-white hover:bg-[#e0264b]'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
              {onOpenMessages && (
                <button
                  onClick={() => onOpenMessages(creator.username)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-white/80 text-center max-w-sm leading-relaxed mb-4">
          {creator.bio}
        </p>
      </div>

      {/* Tabs: Videos, Liked, Saved, Analytics */}
      <div className="flex items-center justify-around border-t border-b border-white/10 bg-black/80 sticky top-14 z-10">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors relative ${
            activeTab === 'videos' ? 'text-white' : 'text-white/40'
          }`}
          title="Uploaded Videos"
        >
          <Grid className="w-4 h-4" />
          {activeTab === 'videos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE2C55]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors relative ${
            activeTab === 'liked' ? 'text-white' : 'text-white/40'
          }`}
          title="Liked Videos"
        >
          <Heart className="w-4 h-4" />
          {activeTab === 'liked' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE2C55]" />
          )}
        </button>
        {isCurrentUser && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 flex items-center justify-center transition-colors relative ${
              activeTab === 'saved' ? 'text-white' : 'text-white/40'
            }`}
            title="Saved Videos"
          >
            <Bookmark className="w-4 h-4" />
            {activeTab === 'saved' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE2C55]" />
            )}
          </button>
        )}
        {isCurrentUser && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 flex items-center justify-center gap-1 transition-colors relative ${
              activeTab === 'analytics' ? 'text-[#25F4EE]' : 'text-white/40 hover:text-white/70'
            }`}
            title="Video Analytics"
          >
            <BarChart3 className="w-4 h-4" />
            {activeTab === 'analytics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#25F4EE]" />
            )}
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'analytics' && isCurrentUser ? (
        <ProfileAnalyticsPanel
          userVideos={userVideos}
          onSelectVideo={onSelectVideo}
        />
      ) : (
        /* Videos Grid Gallery */
        <div className="p-1">
          {displayedVideos.length === 0 ? (
            <div className="py-16 text-center text-white/40 text-xs flex flex-col items-center">
              <Grid className="w-8 h-8 mb-2 opacity-30" />
              <p>
                {activeTab === 'videos'
                  ? 'No videos posted yet'
                  : activeTab === 'liked'
                  ? 'No liked videos yet'
                  : 'No saved videos yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {displayedVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video.id)}
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
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white text-center">Edit Profile</h3>
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 rounded-xl bg-[#FE2C55] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
