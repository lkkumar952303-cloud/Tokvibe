import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, Users, Gift, Sparkles } from 'lucide-react';
import { Creator } from '../types';
import { MOCK_CREATORS, CURRENT_USER } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator?: Creator;
}

interface LiveMessage {
  id: string;
  sender: string;
  text: string;
  color?: string;
  isGift?: boolean;
}

interface FloatingHeartItem {
  id: number;
  x: number;
  color: string;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  isOpen,
  onClose,
  creator = MOCK_CREATORS.rohit_dances,
}) => {
  const [viewerCount, setViewerCount] = useState(14820);
  const [messages, setMessages] = useState<LiveMessage[]>([
    { id: '1', sender: 'ananya_99', text: 'Namaste Rohit bhai! Looking energetic today 🔥' },
    { id: '2', sender: 'kartik_m', text: 'Dance battle kab karoge? 🕺' },
    { id: '3', sender: 'sonali_k', text: 'Love from Delhi! ❤️❤️❤️' },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const [activeGiftBanner, setActiveGiftBanner] = useState<string | null>(null);
  const [showGiftDrawer, setShowGiftDrawer] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate ongoing live stream comments & hearts
  useEffect(() => {
    if (!isOpen) return;

    const dummyUsernames = ['rahul_dance', 'priya_fan', 'vikas_m', 'sneha_v', 'desi_boy', 'tanya_g', 'raj_veer'];
    const dummyPhrases = [
      'Bohot badiya step tha wo!',
      'Hahaha funny expression 😂',
      'Greetings from Bangalore! ✨',
      'Please take my name Rohit bhai! 🤩',
      'Super performance! 💯',
      'Love your videos!',
      'Send some tips for beginner dancers! 🕺',
    ];

    const commentInterval = setInterval(() => {
      const randomUser = dummyUsernames[Math.floor(Math.random() * dummyUsernames.length)];
      const randomPhrase = dummyPhrases[Math.floor(Math.random() * dummyPhrases.length)];
      setMessages((prev) => [
        ...prev.slice(-30),
        { id: Math.random().toString(), sender: randomUser, text: randomPhrase },
      ]);
      setViewerCount((v) => v + Math.floor(Math.random() * 5) - 2);
    }, 2400);

    const heartInterval = setInterval(() => {
      const colors = ['#FE2C55', '#25F4EE', '#FACE15', '#ec4899'];
      const newHeart: FloatingHeartItem = {
        id: Date.now() + Math.random(),
        x: Math.floor(Math.random() * 80) + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setFloatingHearts((prev) => [...prev.slice(-15), newHeart]);
    }, 1200);

    return () => {
      clearInterval(commentInterval);
      clearInterval(heartInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: CURRENT_USER.username,
        text: inputMsg.trim(),
        color: '#25F4EE',
      },
    ]);
    setInputMsg('');
    audioEngine.playHeartPop();
  };

  const handleTapHeart = () => {
    const newHeart: FloatingHeartItem = {
      id: Date.now(),
      x: 75 + (Math.random() * 15 - 7.5),
      color: '#FE2C55',
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    audioEngine.playHeartPop();
  };

  const handleSendGift = (giftName: string, icon: string) => {
    setActiveGiftBanner(`${CURRENT_USER.displayName} sent ${giftName} ${icon}!`);
    audioEngine.playGiftSound();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: CURRENT_USER.username,
        text: `Sent a ${giftName} ${icon}! 🎉`,
        isGift: true,
        color: '#FACE15',
      },
    ]);
    setShowGiftDrawer(false);
    setTimeout(() => setActiveGiftBanner(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between max-w-lg mx-auto select-none overflow-hidden animate-in fade-in duration-200">
      {/* Live Video Background Stream */}
      <div className="absolute inset-0 z-0">
        <video
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          autoPlay
          loop
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {/* Scrims */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
      </div>

      {/* Floating Animated Hearts in bottom right */}
      <div className="absolute bottom-20 right-4 w-28 h-64 pointer-events-none z-20 overflow-hidden">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-0 animate-float-note"
            style={{ left: `${h.x}%` }}
          >
            <Heart className="w-7 h-7 filter drop-shadow-md" style={{ color: h.color, fill: h.color }} />
          </div>
        ))}
      </div>

      {/* Gift Banner Celebration Notification */}
      {activeGiftBanner && (
        <div className="absolute top-24 left-4 right-4 z-40 bg-gradient-to-r from-[#FE2C55] via-[#FACE15] to-[#25F4EE] p-0.5 rounded-2xl shadow-2xl animate-bounce">
          <div className="bg-black/90 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FACE15]" />
            <span className="text-xs font-black text-white">{activeGiftBanner}</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between p-4 pt-6">
        {/* Host Avatar & Name */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md py-1 px-2.5 rounded-full border border-white/10">
          <img
            src={creator.avatar}
            alt={creator.displayName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-white"
          />
          <div className="text-left">
            <p className="text-xs font-bold text-white leading-none">{creator.displayName}</p>
            <span className="text-[10px] text-white/60">LIVE Host</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-[#FE2C55] text-[9px] font-black uppercase text-white tracking-wider ml-1">
            LIVE
          </span>
        </div>

        {/* Viewers & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-bold text-white border border-white/10">
            <Users className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span>{(viewerCount / 1000).toFixed(1)}k</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Live Comments & Actions */}
      <div className="relative z-20 p-4 flex flex-col justify-end space-y-3">
        {/* Scrolling Chat Box */}
        <div className="max-h-48 overflow-y-auto no-scrollbar space-y-2 pr-16 mask-gradient">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-1.5 px-3 rounded-xl max-w-xs text-xs backdrop-blur-md ${
                m.isGift
                  ? 'bg-amber-500/20 border border-amber-400/30'
                  : 'bg-black/50'
              }`}
            >
              <span className="font-bold mr-1.5" style={{ color: m.color || '#ffffff' }}>
                {m.sender}:
              </span>
              <span className="text-white/95">{m.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Live Bottom Bar */}
        <div className="flex items-center gap-2 pt-2">
          <form onSubmit={handleSendLiveMessage} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Comment in live..."
              className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="w-8 h-8 rounded-full bg-[#FE2C55] disabled:opacity-40 text-white flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Gift Drawer Trigger */}
          <button
            onClick={() => setShowGiftDrawer(!showGiftDrawer)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FACE15] to-[#FE2C55] flex items-center justify-center shadow-lg active:scale-95 transition-transform text-white shrink-0"
          >
            <Gift className="w-5 h-5 fill-white" />
          </button>

          {/* Floating Heart Tap Button */}
          <button
            onClick={handleTapHeart}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg active:scale-125 transition-transform text-[#FE2C55] shrink-0"
          >
            <Heart className="w-5 h-5 fill-[#FE2C55]" />
          </button>
        </div>

        {/* Gift Selector Drawer */}
        {showGiftDrawer && (
          <div className="p-3 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-2xl grid grid-cols-4 gap-2 animate-in slide-in-from-bottom duration-150">
            {[
              { name: 'Rose', icon: '🌹', cost: '1 coin' },
              { name: 'Crown', icon: '👑', cost: '50 coins' },
              { name: 'Rocket', icon: '🚀', cost: '100 coins' },
              { name: 'Super Star', icon: '⭐', cost: '20 coins' },
            ].map((g) => (
              <button
                key={g.name}
                onClick={() => handleSendGift(g.name, g.icon)}
                className="flex flex-col items-center p-2 rounded-xl bg-black/40 hover:bg-white/10 active:scale-95 transition-all text-center"
              >
                <span className="text-2xl mb-1">{g.icon}</span>
                <span className="text-[10px] font-bold text-white">{g.name}</span>
                <span className="text-[9px] text-[#FACE15]">{g.cost}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
