import React, { useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { Comment } from '../types';
import { formatCount } from '../utils/format';
import { CURRENT_USER } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  totalComments: number;
  onAddComment: (text: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  comments,
  totalComments,
  onAddComment,
}) => {
  const [inputText, setInputText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newComment: Comment = {
      id: 'c_user_' + Date.now(),
      userId: CURRENT_USER.id,
      username: CURRENT_USER.username,
      displayName: CURRENT_USER.displayName,
      avatar: CURRENT_USER.avatar,
      text: inputText.trim(),
      likes: 0,
      isLiked: false,
      createdAt: 'Just now',
    };

    setLocalComments([newComment, ...localComments]);
    onAddComment(inputText.trim());
    setInputText('');
    audioEngine.playHeartPop();
  };

  const handleQuickEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const toggleCommentLike = (commentId: string) => {
    setLocalComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : c.likes - 1,
          };
        }
        return c;
      })
    );
    audioEngine.playHeartPop();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Sheet Container */}
      <div className="relative w-full max-w-lg bg-[#18181b] rounded-t-2xl shadow-2xl z-10 flex flex-col h-[70vh] max-h-[600px] border-t border-white/10 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="w-8" />
          <h3 className="text-sm font-bold text-white text-center">
            {formatCount(totalComments)} comments
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {localComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-white/50">
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            localComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <img
                  src={comment.avatar}
                  alt={comment.displayName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-white/90">
                      {comment.displayName}
                    </span>
                    <span className="text-[11px] text-white/40">
                      @{comment.username} · {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-white/95 mt-1 leading-relaxed break-words">
                    {comment.text}
                  </p>
                </div>
                {/* Comment Like Heart */}
                <button
                  onClick={() => toggleCommentLike(comment.id)}
                  className="flex flex-col items-center gap-0.5 text-white/50 hover:text-white transition-colors shrink-0"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      comment.isLiked
                        ? 'fill-[#FE2C55] text-[#FE2C55]'
                        : 'stroke-[2]'
                    }`}
                  />
                  <span className="text-[10px]">{formatCount(comment.likes)}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Emoji Bar */}
        <div className="flex items-center justify-around px-4 py-2 border-t border-white/5 bg-black/30">
          {['❤️', '🔥', '😂', '👏', '💯', '😍', '🙌'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Input Field */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 p-3 bg-[#121215] border-t border-white/10"
        >
          <img
            src={CURRENT_USER.avatar}
            alt="My avatar"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover"
          />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add comment..."
            className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-[#FE2C55] text-white disabled:opacity-40 flex items-center justify-center transition-opacity shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
