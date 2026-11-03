import React from 'react';
import { Home, Compass, MessageSquare, User, Plus } from 'lucide-react';

export type TabType = 'home' | 'discover' | 'inbox' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenCreate: () => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreate,
  unreadCount = 2,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-white/10 max-w-lg mx-auto select-none">
      <div className="grid grid-cols-5 items-center h-14 px-2">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform text-center min-h-[44px]"
        >
          <Home
            className={`w-5 h-5 transition-colors ${
              activeTab === 'home' ? 'text-white' : 'text-white/50'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight ${
              activeTab === 'home' ? 'text-white font-bold' : 'text-white/50'
            }`}
          >
            Home
          </span>
        </button>

        {/* Discover */}
        <button
          onClick={() => onSelectTab('discover')}
          className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform text-center min-h-[44px]"
        >
          <Compass
            className={`w-5 h-5 transition-colors ${
              activeTab === 'discover' ? 'text-white' : 'text-white/50'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight ${
              activeTab === 'discover' ? 'text-white font-bold' : 'text-white/50'
            }`}
          >
            Discover
          </span>
        </button>

        {/* Create Video Center Button (+) */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenCreate}
            className="tiktok-plus-btn group shadow-lg min-h-[44px] flex items-center justify-center"
            title="Create video"
          >
            <Plus className="w-5 h-5 text-black stroke-[3]" />
          </button>
        </div>

        {/* Inbox */}
        <button
          onClick={() => onSelectTab('inbox')}
          className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform text-center relative min-h-[44px]"
        >
          <div className="relative">
            <MessageSquare
              className={`w-5 h-5 transition-colors ${
                activeTab === 'inbox' ? 'text-white' : 'text-white/50'
              }`}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FE2C55] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-black shadow">
                {unreadCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight ${
              activeTab === 'inbox' ? 'text-white font-bold' : 'text-white/50'
            }`}
          >
            Inbox
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform text-center min-h-[44px]"
        >
          <User
            className={`w-5 h-5 transition-colors ${
              activeTab === 'profile' ? 'text-white' : 'text-white/50'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight ${
              activeTab === 'profile' ? 'text-white font-bold' : 'text-white/50'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </div>
  );
};
