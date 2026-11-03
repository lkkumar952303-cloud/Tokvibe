/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Tv, Search, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { VideoItem, Creator, Sound } from './types';
import { INITIAL_VIDEOS, CURRENT_USER, MOCK_SOUNDS } from './data/mockData';
import { VideoPlayer } from './components/VideoPlayer';
import { FeedOverlay } from './components/FeedOverlay';
import { CommentModal } from './components/CommentModal';
import { ShareModal } from './components/ShareModal';
import { CreateVideoModal } from './components/CreateVideoModal';
import { DiscoverView } from './components/DiscoverView';
import { InboxView } from './components/InboxView';
import { ProfileView } from './components/ProfileView';
import { SoundDetailModal } from './components/SoundDetailModal';
import { LiveStreamModal } from './components/LiveStreamModal';
import { BottomNav, TabType } from './components/BottomNav';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [feedMode, setFeedMode] = useState<'forYou' | 'following'>('forYou');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [followingIds, setFollowingIds] = useState<string[]>(['c_priya']);
  const [currentUser, setCurrentUser] = useState<Creator>(CURRENT_USER);

  // Modals & Sub-views
  const [commentingVideoId, setCommentingVideoId] = useState<string | null>(null);
  const [sharingVideo, setSharingVideo] = useState<VideoItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [initialCreateSound, setInitialCreateSound] = useState<Sound | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [showLiveStream, setShowLiveStream] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [seekPercent, setSeekPercent] = useState<number | null>(null);

  // Auto-advance & IntersectionObserver tracking
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const videoItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAutoScrollingRef = useRef<boolean>(false);
  const autoScrollCooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swipe gesture tracking (vertical scroll and horizontal swipe to creator profile)
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const mouseStartX = useRef<number | null>(null);
  const mouseStartY = useRef<number | null>(null);
  const mouseStartTime = useRef<number>(0);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);

  // Language preference: Hinglish/Hindi or English
  const [isHindi, setIsHindi] = useState<boolean>(true);

  // Filter videos based on For You vs Following
  const filteredFeedVideos =
    feedMode === 'following'
      ? videos.filter((v) => followingIds.includes(v.creator.id))
      : videos;

  // Active current video in feed
  const currentVideo = filteredFeedVideos[activeIndex] || filteredFeedVideos[0] || videos[0];

  // Stop audio when switching away from Home tab or when video pauses
  useEffect(() => {
    if (activeTab !== 'home' || !isPlaying) {
      audioEngine.stop();
    } else if (currentVideo && isPlaying) {
      audioEngine.playSound(currentVideo.sound.beatType);
    }
  }, [activeTab, activeIndex, isPlaying, currentVideo]);

  // Smoothly scroll to video by index
  const scrollToVideoIndex = (index: number, reason?: string) => {
    if (index < 0 || index >= filteredFeedVideos.length) return;
    if (isAutoScrollingRef.current) return;

    isAutoScrollingRef.current = true;
    setActiveIndex(index);
    setProgress(0);
    setIsPlaying(true);

    const targetEl = videoItemRefs.current[index];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (autoScrollCooldownTimerRef.current) {
      clearTimeout(autoScrollCooldownTimerRef.current);
    }
    autoScrollCooldownTimerRef.current = setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 750);
  };

  // Auto scroll to next video when the current one finishes playing
  const handleVideoEnded = () => {
    if (!autoAdvance) return;
    if (activeIndex < filteredFeedVideos.length - 1) {
      scrollToVideoIndex(activeIndex + 1, 'video_ended');
    } else {
      // Loop back to first video at end of feed
      scrollToVideoIndex(0, 'video_ended');
    }
  };

  // Keyboard navigation for desktop users (arrows for feed & profile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If a creator profile is currently open, ArrowRight or Escape closes it and returns to feed
      if (selectedCreator) {
        if (e.key === 'ArrowRight' || e.key === 'Escape') {
          e.preventDefault();
          setSelectedCreator(null);
        }
        return;
      }

      if (activeTab !== 'home') return;
      if (commentingVideoId || sharingVideo || showCreateModal || showLiveStream) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextVideo();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevVideo();
      } else if (e.key === 'ArrowLeft') {
        // Horizontal swipe left shortcut: Navigate to Creator Profile
        e.preventDefault();
        if (currentVideo?.creator) {
          audioEngine.playHeartPop();
          setSelectedCreator(currentVideo.creator);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted((m) => !m);
      } else if (e.key.toLowerCase() === 'l' && currentVideo) {
        handleToggleLike(currentVideo.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, activeIndex, currentVideo, selectedCreator, commentingVideoId, sharingVideo, showCreateModal, showLiveStream, filteredFeedVideos.length]);

  // Navigation between videos
  const handleNextVideo = () => {
    if (activeIndex < filteredFeedVideos.length - 1) {
      scrollToVideoIndex(activeIndex + 1, 'manual_next');
    }
  };

  const handlePrevVideo = () => {
    if (activeIndex > 0) {
      scrollToVideoIndex(activeIndex - 1, 'manual_prev');
    }
  };

  // Touch Swipe handlers for mobile:
  // - Vertical swipe (up/down) changes video
  // - Horizontal swipe left navigates to the creator's profile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX; // positive = swiped left
    const diffY = touchStartY.current - touchEndY; // positive = swiped up
    const elapsed = Date.now() - touchStartTime.current;

    // Horizontal swipe left gesture (TikTok signature: swipe left to view creator's profile)
    // Threshold: moved at least 55px left, predominantly horizontal movement, gesture completed within 800ms
    if (diffX > 55 && Math.abs(diffX) > Math.abs(diffY) * 1.25 && elapsed < 800) {
      if (currentVideo?.creator) {
        audioEngine.playHeartPop();
        setSelectedCreator(currentVideo.creator);
      }
      return;
    }

    // Vertical swipe: Next / Previous video
    if (Math.abs(diffY) > Math.abs(diffX)) {
      if (diffY > 50) {
        // Swiped Up -> Next video
        handleNextVideo();
      } else if (diffY < -50) {
        // Swiped Down -> Previous video
        handlePrevVideo();
      }
    }
  };

  // Mouse drag gesture handlers for desktop users (click-drag left to open creator profile)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseStartX.current = e.clientX;
    mouseStartY.current = e.clientY;
    mouseStartTime.current = Date.now();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null || mouseStartY.current === null) return;
    const diffX = mouseStartX.current - e.clientX;
    const diffY = mouseStartY.current - e.clientY;
    const elapsed = Date.now() - mouseStartTime.current;
    mouseStartX.current = null;
    mouseStartY.current = null;

    // Predominantly leftward drag
    if (diffX > 65 && Math.abs(diffX) > Math.abs(diffY) * 1.3 && elapsed < 800) {
      if (currentVideo?.creator) {
        audioEngine.playHeartPop();
        setSelectedCreator(currentVideo.creator);
      }
    }
  };

  // Wheel scroll debounce for smooth snapping
  const wheelLockRef = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (activeTab !== 'home' || wheelLockRef.current) return;
    if (Math.abs(e.deltaY) > 40) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        handleNextVideo();
      } else {
        handlePrevVideo();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }
  };

  // Reset scroll position when switching feed mode or active tab
  useEffect(() => {
    if (activeTab === 'home' && feedContainerRef.current) {
      feedContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      setActiveIndex(0);
      setProgress(0);
    }
  }, [feedMode, activeTab]);

  // Intersection Observer in the main feed:
  // Automatically scroll to the next video when the current one is partially out of view,
  // and synchronize activeIndex with currently visible video item.
  useEffect(() => {
    if (activeTab !== 'home') return;
    const container = feedContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-video-index'));
          if (isNaN(index)) return;

          // If the currently active video is partially out of view:
          // User started scrolling and intersectionRatio drops below 0.70
          if (index === activeIndex && !isAutoScrollingRef.current) {
            if (entry.intersectionRatio < 0.70 && entry.intersectionRatio > 0.05) {
              const rect = entry.boundingClientRect;
              const containerRect = container.getBoundingClientRect();
              const isScrollingDown = rect.top < containerRect.top + 30;
              const targetIndex = isScrollingDown ? index + 1 : index - 1;

              if (targetIndex >= 0 && targetIndex < filteredFeedVideos.length) {
                scrollToVideoIndex(targetIndex, 'partial_out_of_view');
              }
            }
          }

          // When a video card is in majority view (>= 55% visible), set it as the active video
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            if (index !== activeIndex && !isAutoScrollingRef.current) {
              setActiveIndex(index);
              setProgress(0);
              setIsPlaying(true);
            }
          }
        });
      },
      {
        root: container,
        threshold: [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1.0],
      }
    );

    videoItemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [activeTab, activeIndex, filteredFeedVideos.length, autoAdvance]);

  // Likes & Interactions
  const handleToggleLike = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isLiked = !v.isLiked;
          return {
            ...v,
            isLiked,
            likes: isLiked ? v.likes + 1 : v.likes - 1,
          };
        }
        return v;
      })
    );
  };

  const handleDoubleTapHeart = (_x: number, _y: number) => {
    if (currentVideo && !currentVideo.isLiked) {
      handleToggleLike(currentVideo.id);
    }
  };

  const handleToggleBookmark = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isBookmarked = !v.isBookmarked;
          return {
            ...v,
            isBookmarked,
            bookmarksCount: isBookmarked ? v.bookmarksCount + 1 : v.bookmarksCount - 1,
          };
        }
        return v;
      })
    );
    audioEngine.playHeartPop();
  };

  const handleToggleRepost = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isReposted = !v.isReposted;
          return {
            ...v,
            isReposted,
            sharesCount: isReposted ? v.sharesCount + 1 : v.sharesCount - 1,
          };
        }
        return v;
      })
    );
  };

  const handleToggleFollow = (creatorId: string) => {
    setFollowingIds((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const handleAddComment = (text: string) => {
    if (!commentingVideoId) return;
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === commentingVideoId) {
          return {
            ...v,
            commentsCount: v.commentsCount + 1,
            comments: [
              {
                id: 'c_' + Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                displayName: currentUser.displayName,
                avatar: currentUser.avatar,
                text,
                likes: 0,
                createdAt: 'Just now',
              },
              ...v.comments,
            ],
          };
        }
        return v;
      })
    );
  };

  const handlePublishNewVideo = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
    setActiveIndex(0);
    setActiveTab('home');
    setFeedMode('forYou');
    setIsPlaying(true);
  };

  const handleUseSoundInCamera = (sound: Sound) => {
    setInitialCreateSound(sound);
    setSelectedSound(null);
    setShowCreateModal(true);
  };

  return (
    <div className="relative w-screen h-screen bg-[#09090b] text-white flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#25F4EE]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#FE2C55]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Keyboard Helper Bar (Hidden on Mobile) */}
      <div className="hidden lg:flex fixed top-4 right-6 z-30 items-center gap-3 text-xs text-white/60 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10">
        <Keyboard className="w-4 h-4 text-[#25F4EE]" />
        <span>Use <b>↑ / ↓</b> keys to scroll</span>
        <span>·</span>
        <span><b>←</b> Creator profile (or swipe left)</span>
        <span>·</span>
        <span><b>Space</b> to pause</span>
        <span>·</span>
        <span><b>L</b> to like</span>
        <span>·</span>
        <span><b>M</b> to mute</span>
        <button
          onClick={() => setIsHindi(!isHindi)}
          className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
        >
          {isHindi ? 'हिंदी / Hinglish' : 'English'}
        </button>
      </div>

      {/* Main Smartphone-proportioned Viewport Container */}
      <main className="relative w-full h-full max-w-[430px] md:h-[95vh] md:max-h-[880px] md:rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 flex flex-col">
        {/* Tab 1: Home Feed */}
        {activeTab === 'home' && !selectedCreator && (
          <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Top Bar Floating Header: LIVE button, Auto-scroll toggle, Following / For You, Search */}
            <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-4 pb-2 select-none">
              <div className="flex items-center gap-1.5">
                {/* LIVE Stream Button */}
                <button
                  onClick={() => setShowLiveStream(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors text-white active:scale-95"
                >
                  <Tv className="w-3.5 h-3.5 text-[#FE2C55] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    LIVE
                  </span>
                </button>

                {/* Auto-Scroll Toggle Badge */}
                <button
                  onClick={() => setAutoAdvance(!autoAdvance)}
                  title={autoAdvance ? 'Auto-scroll is ON (tap to turn off)' : 'Auto-scroll is OFF (tap to turn on)'}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold backdrop-blur-md transition-all active:scale-95 ${
                    autoAdvance
                      ? 'bg-[#25F4EE]/20 border-[#25F4EE]/60 text-[#25F4EE]'
                      : 'bg-black/40 border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${autoAdvance ? 'bg-[#25F4EE] animate-pulse' : 'bg-white/30'}`} />
                  <span>{autoAdvance ? 'Auto-Scroll ON' : 'Auto-Scroll'}</span>
                </button>
              </div>

              {/* Feed Tabs: Following | For You (Aapke Liye) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFeedMode('following');
                    setActiveIndex(0);
                  }}
                  className={`text-sm font-bold transition-all relative ${
                    feedMode === 'following'
                      ? 'text-white scale-105 drop-shadow'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {isHindi ? 'Following' : 'Following'}
                  {feedMode === 'following' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
                  )}
                </button>
                <span className="text-white/30 text-xs">|</span>
                <button
                  onClick={() => {
                    setFeedMode('forYou');
                    setActiveIndex(0);
                  }}
                  className={`text-sm font-bold transition-all relative ${
                    feedMode === 'forYou'
                      ? 'text-white scale-105 drop-shadow'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {isHindi ? 'Aapke Liye' : 'For You'}
                  {feedMode === 'forYou' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
                  )}
                </button>
              </div>

              {/* Search button (Jump to Discover) */}
              <button
                onClick={() => setActiveTab('discover')}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            </header>

            {/* Scrollable Feed Container */}
            {filteredFeedVideos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white/60">
                <p className="text-sm">
                  {feedMode === 'following'
                    ? 'No videos from creators you follow yet. Check out "Aapke Liye" to discover creators!'
                    : 'No videos available.'}
                </p>
                <button
                  onClick={() => setFeedMode('forYou')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#FE2C55] text-white font-bold text-xs"
                >
                  Switch to For You
                </button>
              </div>
            ) : (
              <div
                ref={feedContainerRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                className="relative w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
              >
                {filteredFeedVideos.map((video, idx) => (
                  <div
                    key={video.id}
                    ref={(el) => {
                      videoItemRefs.current[idx] = el;
                    }}
                    data-video-index={idx}
                    className="relative w-full h-full snap-start snap-always shrink-0 overflow-hidden flex flex-col justify-between"
                  >
                    <VideoPlayer
                      video={video}
                      isActive={activeTab === 'home' && activeIndex === idx}
                      isMuted={isMuted}
                      onToggleMute={() => setIsMuted(!isMuted)}
                      onDoubleTapHeart={handleDoubleTapHeart}
                      progress={activeIndex === idx ? progress : 0}
                      setProgress={setProgress}
                      seekPercent={activeIndex === idx ? seekPercent : null}
                      onSeekComplete={() => setSeekPercent(null)}
                      isPlaying={activeIndex === idx && isPlaying}
                      setIsPlaying={setIsPlaying}
                      onEnded={handleVideoEnded}
                      autoAdvance={autoAdvance}
                    />

                    <FeedOverlay
                      video={video}
                      isPlaying={activeIndex === idx && isPlaying}
                      isFollowing={followingIds.includes(video.creator.id)}
                      onToggleFollow={handleToggleFollow}
                      onToggleLike={handleToggleLike}
                      onOpenComments={() => setCommentingVideoId(video.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onOpenShare={() => setSharingVideo(video)}
                      onSelectCreator={(c) => setSelectedCreator(c)}
                      onSelectSound={() => setSelectedSound(video.sound)}
                      progress={activeIndex === idx ? progress : 0}
                      onSeek={(percent) => setSeekPercent(percent)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Discover / Explore */}
        {activeTab === 'discover' && !selectedCreator && (
          <DiscoverView
            videos={videos}
            onSelectVideo={(vId) => {
              const idx = videos.findIndex((v) => v.id === vId);
              if (idx !== -1) {
                setActiveIndex(idx);
                setActiveTab('home');
                setFeedMode('forYou');
                setIsPlaying(true);
                setTimeout(() => {
                  scrollToVideoIndex(idx, 'discover_select');
                }, 100);
              }
            }}
            onSelectCreator={(c) => setSelectedCreator(c)}
            onSelectSound={(s) => setSelectedSound(s)}
            onToggleFollow={handleToggleFollow}
            followingIds={followingIds}
          />
        )}

        {/* Tab 3: Inbox / Notifications & Chat */}
        {activeTab === 'inbox' && !selectedCreator && <InboxView />}

        {/* Tab 4: Current User Profile */}
        {activeTab === 'profile' && !selectedCreator && (
          <ProfileView
            creator={currentUser}
            isCurrentUser={true}
            isFollowing={false}
            onToggleFollow={() => {}}
            videos={videos}
            onSelectVideo={(vId) => {
              const idx = videos.findIndex((v) => v.id === vId);
              if (idx !== -1) {
                setActiveIndex(idx);
                setActiveTab('home');
                setIsPlaying(true);
                setTimeout(() => {
                  scrollToVideoIndex(idx, 'profile_select');
                }, 100);
              }
            }}
            onUpdateProfile={(updated) =>
              setCurrentUser((prev) => ({ ...prev, ...updated }))
            }
          />
        )}

        {/* Selected Other Creator Profile View (Triggered via swipe left or tapping creator) */}
        {selectedCreator && (
          <div className="absolute inset-0 z-40 bg-black flex flex-col">
            <ProfileView
              creator={selectedCreator}
              isCurrentUser={selectedCreator.id === currentUser.id}
              isFollowing={followingIds.includes(selectedCreator.id)}
              onToggleFollow={handleToggleFollow}
              onBack={() => setSelectedCreator(null)}
              videos={videos}
              onSelectVideo={(vId) => {
                setSelectedCreator(null);
                const idx = videos.findIndex((v) => v.id === vId);
                if (idx !== -1) {
                  setActiveIndex(idx);
                  setActiveTab('home');
                  setIsPlaying(true);
                }
              }}
              onOpenMessages={() => {
                setSelectedCreator(null);
                setActiveTab('inbox');
              }}
            />
          </div>
        )}

        {/* Persistent TikTok Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedCreator(null);
            setActiveTab(tab);
          }}
          onOpenCreate={() => {
            setInitialCreateSound(null);
            setShowCreateModal(true);
          }}
          unreadCount={2}
        />
      </main>

      {/* Slide-Up Comments Drawer */}
      {commentingVideoId && (
        <CommentModal
          isOpen={!!commentingVideoId}
          onClose={() => setCommentingVideoId(null)}
          comments={
            videos.find((v) => v.id === commentingVideoId)?.comments || []
          }
          totalComments={
            videos.find((v) => v.id === commentingVideoId)?.commentsCount || 0
          }
          onAddComment={handleAddComment}
        />
      )}

      {/* Share to Apps & Repost Drawer */}
      {sharingVideo && (
        <ShareModal
          isOpen={!!sharingVideo}
          onClose={() => setSharingVideo(null)}
          video={sharingVideo}
          onToggleRepost={handleToggleRepost}
          onSendDirectMessage={() => {
            setSharingVideo(null);
            setActiveTab('inbox');
          }}
        />
      )}

      {/* TikTok Creator Camera Studio Modal */}
      {showCreateModal && (
        <CreateVideoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPublishVideo={handlePublishNewVideo}
          initialSound={initialCreateSound || MOCK_SOUNDS[0]}
        />
      )}

      {/* Sound Track Details Modal */}
      {selectedSound && (
        <SoundDetailModal
          sound={selectedSound}
          isOpen={!!selectedSound}
          onClose={() => setSelectedSound(null)}
          onUseSound={handleUseSoundInCamera}
          videos={videos}
          onSelectVideo={(vId) => {
            setSelectedSound(null);
            const idx = videos.findIndex((v) => v.id === vId);
            if (idx !== -1) {
              setActiveIndex(idx);
              setActiveTab('home');
              setIsPlaying(true);
            }
          }}
        />
      )}

      {/* TikTok LIVE Stream Simulation */}
      {showLiveStream && (
        <LiveStreamModal
          isOpen={showLiveStream}
          onClose={() => setShowLiveStream(false)}
          creator={currentVideo ? currentVideo.creator : undefined}
        />
      )}
    </div>
  );
}
