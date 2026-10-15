import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ExternalLink,
  Disc,
  Tv,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface GlobalPlayerProps {
  onOpenProfileById?: (memberId: string) => void;
}

export const GlobalPlayer: React.FC<GlobalPlayerProps> = ({ onOpenProfileById }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    activeEngine,
    youtubeVideoId,
    showVideoDrawer,
    setShowVideoDrawer,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    audioError,
  } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    seek(newTime);
  };

  return (
    <>
      {/* Floating Video Drawer / Pop-up for Full Music Video */}
      {showVideoDrawer && youtubeVideoId && (
        <div className="fixed bottom-36 md:bottom-24 right-4 z-50 w-80 sm:w-96 rounded-2xl bg-[#141A17] border border-[#1ED760]/40 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between p-3 bg-[#1B241F] border-b border-[#2A352E]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#1ED760] animate-ping" />
              <span className="text-xs font-bold text-[#F5F7F5] truncate">
                {currentTrack.songTitle} — Full Song
              </span>
            </div>
            <button
              onClick={() => setShowVideoDrawer(false)}
              className="p-1 rounded-lg text-[#A7B0AA] hover:text-[#F5F7F5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative aspect-video w-full bg-black">
            <iframe
              id="yt-full-player-iframe"
              src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&enablejsapi=1&playsinline=1`}
              title={currentTrack.songTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <div className="p-2 text-center text-[10px] text-[#A7B0AA] bg-[#0B0F0D]">
            Sedang memutar lagu versi lengkap SPI 1A
          </div>
        </div>
      )}

      {/* Hidden background player for full music when drawer is closed */}
      {!showVideoDrawer && activeEngine === 'youtube' && youtubeVideoId && (
        <div className="fixed -bottom-96 -right-96 w-10 h-10 opacity-0 pointer-events-none">
          <iframe
            id="yt-full-player-iframe"
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&enablejsapi=1&playsinline=1`}
            title={currentTrack.songTitle}
            allow="autoplay"
          />
        </div>
      )}

      {/* Bottom Sticky Player */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-[#0B0F0D]/95 backdrop-blur-xl border-t border-[#2A352E] shadow-2xl transition-all">
        {/* Top micro progress bar */}
        <div className="w-full h-1 bg-[#1B241F] relative group cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-[#145A43] via-[#1ED760] to-[#52e88a] transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent || 0}
            onChange={handleSeekChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Column: Track Info & Contributor Student */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-[40%] sm:max-w-[30%]">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#1B241F] border border-[#2A352E] shrink-0">
              <img
                src={currentTrack.albumArtwork}
                alt={currentTrack.songTitle}
                className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-1" />
                    <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-2" />
                    <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs sm:text-sm font-bold text-[#F5F7F5] truncate leading-tight">
                  {currentTrack.songTitle}
                </p>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-[#145A43] text-[#1ED760] border border-[#1ED760]/30 shrink-0">
                  FULL SONG
                </span>
              </div>
              <p className="text-[11px] text-[#A7B0AA] truncate mt-0.5">
                {currentTrack.artistName}
              </p>
              <button
                onClick={() => onOpenProfileById && onOpenProfileById(currentTrack.memberId)}
                className="text-[10px] text-[#1ED760] hover:underline truncate block text-left font-medium"
              >
                Oleh: {currentTrack.studentName}
              </button>
            </div>
          </div>

          {/* Center Column: Audio Controls & Progress */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
            {/* Main Buttons */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={toggleShuffle}
                className={`hidden sm:block p-1.5 rounded-lg text-xs transition-colors ${
                  isShuffle ? 'text-[#1ED760]' : 'text-[#A7B0AA] hover:text-[#F5F7F5]'
                }`}
                title="Acak / Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={prevTrack}
                className="p-1.5 text-[#A7B0AA] hover:text-[#F5F7F5] transition-colors cursor-pointer"
                title="Lagu Sebelumnya"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1ED760] text-[#0B0F0D] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#1ED760]/20 flex items-center justify-center cursor-pointer"
                title={isPlaying ? 'Jeda lagu' : 'Putar lagu penuh'}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#0B0F0D] border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-1.5 text-[#A7B0AA] hover:text-[#F5F7F5] transition-colors cursor-pointer"
                title="Lagu Selanjutnya"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`hidden sm:block p-1.5 rounded-lg text-xs transition-colors ${
                  isRepeat ? 'text-[#1ED760]' : 'text-[#A7B0AA] hover:text-[#F5F7F5]'
                }`}
                title="Ulangi / Repeat"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Scrubber (desktop) */}
            <div className="hidden sm:flex items-center gap-2.5 w-full text-[10px] text-[#A7B0AA] font-mono">
              <span>{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-1.5 bg-[#1B241F] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1ED760] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[#1ED760] font-bold">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Column: Toggle Video Mode & Volume */}
          <div className="flex items-center justify-end gap-2.5 min-w-[20%] sm:min-w-[25%]">
            {youtubeVideoId && (
              <button
                onClick={() => setShowVideoDrawer((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showVideoDrawer
                    ? 'bg-[#1ED760] text-[#0B0F0D] border-[#1ED760]'
                    : 'bg-[#141A17] hover:bg-[#1B241F] text-[#1ED760] border-[#2A352E]'
                }`}
                title="Tampilkan video resmi / lagu lengkap"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {showVideoDrawer ? 'Tutup Video' : 'Video Penuh'}
                </span>
              </button>
            )}

            {/* Volume Control */}
            <div className="relative flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 text-[#A7B0AA] hover:text-[#F5F7F5] transition-colors"
                title={isMuted ? 'Batal bisu' : 'Bisu'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-[#1B241F] accent-[#1ED760] rounded-lg cursor-pointer hidden sm:block"
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
