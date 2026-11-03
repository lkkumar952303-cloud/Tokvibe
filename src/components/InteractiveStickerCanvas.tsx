import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Trash2, Copy, X } from 'lucide-react';
import { PlacedSticker } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface InteractiveStickerCanvasProps {
  stickers: PlacedSticker[];
  onUpdateStickers?: (stickers: PlacedSticker[]) => void;
  isInteractive?: boolean; // true during creation/editing, false during feed playback
}

export const InteractiveStickerCanvas: React.FC<InteractiveStickerCanvasProps> = ({
  stickers,
  onUpdateStickers,
  isInteractive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);

  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
  const activeStickerRef = useRef<string | null>(null);

  // Deselect sticker when clicking on canvas background
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    if (e.target === containerRef.current) {
      setSelectedId(null);
    }
  };

  // Dragging logic via Pointer Events (works for both touch & mouse)
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (!isInteractive || !containerRef.current) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setSelectedId(id);
    activeStickerRef.current = id;
    setIsDragging(true);

    const rect = containerRef.current.getBoundingClientRect();
    const current = stickers.find((s) => s.id === id);
    if (!current) return;

    // Calculate current pixel position from percentage
    const curPixelX = (current.x / 100) * rect.width;
    const curPixelY = (current.y / 100) * rect.height;

    dragOffsetRef.current = {
      offsetX: e.clientX - (rect.left + curPixelX),
      offsetY: e.clientY - (rect.top + curPixelY),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !activeStickerRef.current || !containerRef.current || !onUpdateStickers) return;
    const rect = containerRef.current.getBoundingClientRect();

    const newPixelX = e.clientX - rect.left - dragOffsetRef.current.offsetX;
    const newPixelY = e.clientY - rect.top - dragOffsetRef.current.offsetY;

    // Convert back to percentage (bounded between 5% and 95%)
    const pctX = Math.max(6, Math.min(94, (newPixelX / rect.width) * 100));
    const pctY = Math.max(6, Math.min(94, (newPixelY / rect.height) * 100));

    // Check if dragging over bottom trash zone (bottom 18% and center 40%)
    const overTrash = pctY > 80 && Math.abs(pctX - 50) < 25;
    setIsOverTrash(overTrash);

    onUpdateStickers(
      stickers.map((s) => (s.id === activeStickerRef.current ? { ...s, x: pctX, y: pctY } : s))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !activeStickerRef.current) return;

    if (isOverTrash && onUpdateStickers) {
      // Delete sticker dropped in trash
      audioEngine.playHeartPop();
      onUpdateStickers(stickers.filter((s) => s.id !== activeStickerRef.current));
      setSelectedId(null);
    }

    setIsDragging(false);
    setIsOverTrash(false);
    activeStickerRef.current = null;
  };

  // Sticker Manipulation Controls
  const handleRotate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateStickers) return;
    audioEngine.playHeartPop();
    onUpdateStickers(
      stickers.map((s) => (s.id === id ? { ...s, rotation: (s.rotation + 45) % 360 } : s))
    );
  };

  const handleScale = (id: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateStickers) return;
    audioEngine.playHeartPop();
    onUpdateStickers(
      stickers.map((s) =>
        s.id === id
          ? { ...s, scale: Math.max(0.6, Math.min(2.8, Number((s.scale + delta).toFixed(1)))) }
          : s
      )
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateStickers) return;
    audioEngine.playHeartPop();
    onUpdateStickers(stickers.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateStickers) return;
    const target = stickers.find((s) => s.id === id);
    if (!target) return;
    audioEngine.playHeartPop();
    const cloned: PlacedSticker = {
      ...target,
      id: 'stk_' + Date.now() + Math.random().toString(36).substring(2, 5),
      x: Math.min(85, target.x + 8),
      y: Math.min(85, target.y + 8),
    };
    onUpdateStickers([...stickers, cloned]);
    setSelectedId(cloned.id);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute inset-0 z-30 overflow-hidden select-none ${
        isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Placed Stickers */}
      {stickers.map((stk) => {
        const isSelected = isInteractive && selectedId === stk.id;

        return (
          <div
            key={stk.id}
            onPointerDown={(e) => handlePointerDown(e, stk.id)}
            style={{
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`,
              transformOrigin: 'center center',
            }}
            className={`absolute flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow ${
              isInteractive ? 'touch-none' : ''
            }`}
          >
            {/* Selection Highlight Bounding Box */}
            {isSelected && (
              <div className="absolute -inset-2.5 rounded-2xl border-2 border-dashed border-[#25F4EE] shadow-lg shadow-[#25F4EE]/30 pointer-events-none animate-pulse" />
            )}

            {/* Sticker Visuals based on Type */}
            {stk.type === 'emoji' && (
              <span className="text-5xl filter drop-shadow-xl select-none leading-none">
                {stk.content}
              </span>
            )}

            {stk.type === 'badge' && (
              <div
                className="px-3 py-1.5 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center border border-white/20 select-none whitespace-nowrap"
                style={{
                  background: stk.bgColor || '#FE2C55',
                  color: stk.color || '#FFFFFF',
                }}
              >
                <span className="text-xs font-black drop-shadow tracking-wide">
                  {stk.content}
                </span>
                {stk.subText && (
                  <span className="text-[9px] font-semibold opacity-90">
                    {stk.subText}
                  </span>
                )}
              </div>
            )}

            {stk.type === 'custom_text' && (
              <div
                className="px-3.5 py-1.5 rounded-xl shadow-2xl text-center font-black text-sm tracking-wide border border-white/20 select-none whitespace-nowrap"
                style={{
                  backgroundColor: stk.bgColor || '#FE2C55',
                  color: stk.color || '#FFFFFF',
                }}
              >
                {stk.content}
              </div>
            )}

            {/* Interactive Floating Action Toolbar when Selected */}
            {isSelected && isInteractive && !isDragging && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl z-50 animate-in fade-in zoom-in-90 duration-150"
              >
                <button
                  type="button"
                  onClick={(e) => handleRotate(stk.id, e)}
                  title="Rotate 45°"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleScale(stk.id, 0.2, e)}
                  title="Make bigger"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleScale(stk.id, -0.2, e)}
                  title="Make smaller"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDuplicate(stk.id, e)}
                  title="Duplicate sticker"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(stk.id, e)}
                  title="Delete sticker"
                  className="w-7 h-7 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Drag-to-Delete Bottom Trash Zone */}
      {isDragging && (
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-2.5 rounded-full flex items-center gap-2 border shadow-2xl transition-all duration-150 ${
            isOverTrash
              ? 'bg-red-600 border-red-400 text-white scale-110 shadow-red-500/40'
              : 'bg-black/75 backdrop-blur-md border-white/20 text-white/70'
          }`}
        >
          <Trash2 className={`w-4 h-4 ${isOverTrash ? 'animate-bounce text-white' : 'text-red-400'}`} />
          <span className="text-xs font-bold">
            {isOverTrash ? 'Release to Delete!' : 'Drag here to remove'}
          </span>
        </div>
      )}
    </div>
  );
};
