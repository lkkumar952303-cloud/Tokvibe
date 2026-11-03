export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  bio: string;
  followers: number;
  following: number;
  totalLikes: number;
  isFollowing?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  text: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Sound {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: number; // in seconds
  useCount: number;
  beatType: 'dholak_edm' | 'lofi_chill' | 'synth_pop' | 'funny_bounce' | 'acoustic_guitar';
}

export type TransitionType = 'none' | 'fade' | 'slide' | 'wipe' | 'zoom' | 'flash' | 'glitch';
export type RecordingSpeed = '0.3x' | '0.5x' | '1x' | '2x' | '3x';

export interface VideoSegment {
  id: string;
  url: string;
  duration: number; // in seconds
  label: string;
  filterId?: string;
  speed?: RecordingSpeed;
}

export interface PlacedSticker {
  id: string;
  type: 'emoji' | 'badge' | 'custom_text';
  content: string; // emoji or badge title
  subText?: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  scale: number; // 0.6 to 2.5
  rotation: number; // -180 to 180 degrees
  color?: string;
  bgColor?: string;
}

export interface VideoItem {
  id: string;
  creator: Creator;
  videoUrl: string;
  caption: string;
  tags: string[];
  sound: Sound;
  likes: number;
  commentsCount: number;
  bookmarksCount: number;
  sharesCount: number;
  viewsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
  comments: Comment[];
  category: 'dance' | 'comedy' | 'food' | 'art' | 'lifestyle' | 'music';
  createdAt: string;
  filter?: string;
  filterIntensity?: number;
  voiceoverUrl?: string;
  voiceoverVolume?: number;
  originalSoundVolume?: number;
  segments?: VideoSegment[];
  transition?: TransitionType;
  transitionDuration?: number;
  speed?: RecordingSpeed;
  stickers?: PlacedSticker[];
  cropConfig?: VideoCropConfig;
}

export interface VideoCropConfig {
  x: number; // 0 to 100% horizontal center
  y: number; // 0 to 100% vertical center
  zoom: number; // 1.0 to 2.0
  mode: 'face_auto' | 'manual' | 'center';
  faceDetected?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: {
    username: string;
    displayName: string;
    avatar: string;
  };
  content: string;
  timeAgo: string;
  videoPreview?: string;
  read: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  creator: Creator;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
}
