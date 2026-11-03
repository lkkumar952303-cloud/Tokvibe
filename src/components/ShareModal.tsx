import React, { useState } from 'react';
import { X, Copy, Check, Repeat2, Download, MessageSquare, Send } from 'lucide-react';
import { VideoItem } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
  onToggleRepost: (videoId: string) => void;
  onSendDirectMessage: (creatorUsername: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  video,
  onToggleRepost,
  onSendDirectMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    audioEngine.playHeartPop();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Watch this viral TikTok video on TokVibe: ${video.caption} ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`Trending on TokVibe: @${video.creator.username} - ${video.caption}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleDownload = () => {
    setDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          audioEngine.playFollowCheer();
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#18181b] rounded-t-2xl shadow-2xl z-10 flex flex-col p-4 border-t border-white/10 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="w-8" />
          <h3 className="text-sm font-bold text-white text-center">Share to</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Social Apps Share Horizontal Carousel */}
        <div className="py-4 border-b border-white/10">
          <p className="text-[11px] font-semibold text-white/50 mb-3 uppercase tracking-wider">
            Send via
          </p>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg group-active:scale-95 transition-transform text-white">
                <Send className="w-6 h-6 fill-white" />
              </div>
              <span className="text-[11px] text-white/80">WhatsApp</span>
            </button>

            {/* Direct Message (TokVibe Chat) */}
            <button
              onClick={() => {
                onClose();
                onSendDirectMessage(video.creator.username);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] flex items-center justify-center shadow-lg group-active:scale-95 transition-transform text-white">
                <MessageSquare className="w-6 h-6 fill-white" />
              </div>
              <span className="text-[11px] text-white/80">Message</span>
            </button>

            {/* Repost Button */}
            <button
              onClick={() => {
                onToggleRepost(video.id);
                audioEngine.playFollowCheer();
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-transform text-white ${
                  video.isReposted ? 'bg-[#FACE15]' : 'bg-[#FE2C55]'
                }`}
              >
                <Repeat2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] text-white/80">
                {video.isReposted ? 'Reposted' : 'Repost'}
              </span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={handleTwitter}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center shadow-lg group-active:scale-95 transition-transform text-white font-black text-sm">
                X
              </div>
              <span className="text-[11px] text-white/80">Twitter</span>
            </button>

            {/* Download Video */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform text-white">
                <Download className="w-6 h-6" />
              </div>
              <span className="text-[11px] text-white/80">
                {downloading ? `${downloadProgress}%` : 'Save video'}
              </span>
            </button>
          </div>
        </div>

        {/* Copy Link & Action Bar */}
        <div className="pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-3 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
            <span className="text-xs text-white/60 truncate">
              {window.location.origin}/video/{video.id}
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-white text-black font-semibold text-xs px-4 py-2 rounded-xl active:scale-95 transition-transform shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
