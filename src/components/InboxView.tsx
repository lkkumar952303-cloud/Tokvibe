import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Send, ArrowLeft } from 'lucide-react';
import { NotificationItem, Conversation } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_CONVERSATIONS, CURRENT_USER } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface InboxViewProps {
  onSelectCreatorUsername?: (username: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'messages'>('activity');
  const [filterType, setFilterType] = useState<string>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [chatInput, setChatInput] = useState('');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeConv) return;

    const newMessage = {
      id: 'm_' + Date.now(),
      senderId: CURRENT_USER.id,
      text: chatInput.trim(),
      timestamp: 'Just now',
      isMe: true,
    };

    const updatedConv: Conversation = {
      ...activeConv,
      lastMessage: chatInput.trim(),
      lastMessageTime: 'Just now',
      messages: [...activeConv.messages, newMessage],
    };

    setActiveConv(updatedConv);
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );
    setChatInput('');
    audioEngine.playHeartPop();

    // Simulated quick creator reply after 1.5s
    setTimeout(() => {
      const replies = [
        'Awesome bro! Let’s make it happen 🔥',
        'Haha yes absolutely! 💯',
        'Check out my new video and tell me how it is!',
        'Thanks for reaching out! 🙏✨',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMessage = {
        id: 'm_' + (Date.now() + 1),
        senderId: activeConv.creator.id,
        text: randomReply,
        timestamp: 'Just now',
        isMe: false,
      };

      setActiveConv((curr) => {
        if (!curr || curr.id !== updatedConv.id) return curr;
        return {
          ...curr,
          lastMessage: randomReply,
          messages: [...curr.messages, replyMessage],
        };
      });
      audioEngine.playGiftSound();
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col max-w-lg mx-auto pb-20 select-none">
      {/* Top Header & Tab Switcher */}
      <div className="p-4 border-b border-white/10 bg-black/90 sticky top-0 z-20">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => {
              setActiveTab('activity');
              setActiveConv(null);
            }}
            className={`text-sm font-bold pb-1 relative transition-colors ${
              activeTab === 'activity' ? 'text-white' : 'text-white/40'
            }`}
          >
            All Activity
            {activeTab === 'activity' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE2C55]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`text-sm font-bold pb-1 relative transition-colors ${
              activeTab === 'messages' ? 'text-white' : 'text-white/40'
            }`}
          >
            Direct Messages
            {activeTab === 'messages' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE2C55]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'activity' ? (
          /* Activity Feed */
          <div className="p-4 space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'like', label: 'Likes' },
                { id: 'comment', label: 'Comments' },
                { id: 'follow', label: 'Followers' },
                { id: 'mention', label: 'Mentions' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                    filterType === f.id
                      ? 'bg-white text-black'
                      : 'bg-zinc-900 text-white/70 hover:bg-zinc-800 border border-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notification Items */}
            <div className="space-y-3 pt-2">
              {filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900/60 transition-colors cursor-pointer"
                >
                  {/* Icon badge over avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={n.user.avatar}
                      alt={n.user.displayName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center">
                      {n.type === 'like' && <Heart className="w-3 h-3 text-[#FE2C55] fill-[#FE2C55]" />}
                      {n.type === 'comment' && <MessageCircle className="w-3 h-3 text-[#25F4EE]" />}
                      {n.type === 'follow' && <UserPlus className="w-3 h-3 text-emerald-400" />}
                      {n.type === 'mention' && <AtSign className="w-3 h-3 text-[#FACE15]" />}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/90">
                      <span className="font-bold text-white mr-1">
                        {n.user.displayName}
                      </span>
                      {n.content}
                    </p>
                    <span className="text-[10px] text-white/40">{n.timeAgo}</span>
                  </div>

                  {/* Video Thumbnail preview if available */}
                  {n.videoPreview && (
                    <img
                      src={n.videoPreview}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : activeConv ? (
          /* Active Chat Conversation Room */
          <div className="flex flex-col h-full bg-zinc-950">
            {/* Conversation Header */}
            <div className="flex items-center gap-3 p-3 bg-zinc-900 border-b border-white/10">
              <button
                onClick={() => setActiveConv(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={activeConv.creator.avatar}
                alt={activeConv.creator.displayName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold">{activeConv.creator.displayName}</p>
                <p className="text-[10px] text-white/40">@{activeConv.creator.username}</p>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
              {activeConv.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs ${
                      m.isMe
                        ? 'bg-[#FE2C55] text-white rounded-br-xs'
                        : 'bg-zinc-800 text-white/95 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-white/40 mt-0.5 px-1">{m.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="w-8 h-8 rounded-full bg-[#FE2C55] disabled:opacity-40 text-white flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Messages Conversations List */
          <div className="p-3 space-y-2">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConv(c)}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 cursor-pointer border border-white/5 transition-colors"
              >
                <img
                  src={c.creator.avatar}
                  alt={c.creator.displayName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-bold text-white truncate">{c.creator.displayName}</p>
                    <span className="text-[10px] text-white/40">{c.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-white/60 truncate">{c.lastMessage}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FE2C55] shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
