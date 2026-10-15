import React from 'react';
import {
  X,
  Play,
  Pause,
  Edit3,
  Trash2,
  ExternalLink,
  MessageSquareQuote,
  Music,
  Share2,
} from 'lucide-react';
import { MemberProfile, PlayerQueueItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

interface ProfileModalProps {
  member: MemberProfile | null;
  onClose: () => void;
  onEdit: (member: MemberProfile) => void;
  onDelete: (memberId: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  member,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  if (!member) return null;

  const hasAudio = !!member.youtubeId || !!member.fullAudioUrl || !!member.previewUrl;
  const isFull = !!member.youtubeId || !!member.isFullTrack || !!member.fullAudioUrl;
  const isCurrentPlaying = isPlaying && currentTrack?.memberId === member.id;
  const isOwner = user && user.uid === member.uid;

  const handlePlay = () => {
    if (!hasAudio) return;
    const item: PlayerQueueItem = {
      memberId: member.id,
      studentName: member.displayName,
      songTitle: member.songTitle,
      artistName: member.artistName,
      albumArtwork: member.albumArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      previewUrl: member.previewUrl || '',
      fullAudioUrl: member.fullAudioUrl,
      youtubeId: member.youtubeId,
      isFullTrack: isFull,
      trackUrl: member.trackUrl,
    };

    if (currentTrack?.memberId === member.id) {
      togglePlay();
    } else {
      playTrack(item);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Tautan halaman profil telah disalin!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#141A17] border border-[#2A352E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1B241F] text-[#A7B0AA] hover:text-[#F5F7F5] border border-[#2A352E] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top: Large Photo & Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Large Photo (1:1) */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-[#0B0F0D] border-2 border-[#145A43] shrink-0 shadow-xl">
            {member.photoURL ? (
              <img
                src={member.photoURL}
                alt={member.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#145A43] to-[#1B241F] text-[#F5F7F5]">
                <span className="text-5xl font-extrabold text-[#1ED760]">
                  {member.displayName.charAt(0)}
                </span>
                <span className="text-[10px] text-[#A7B0AA] tracking-wider uppercase mt-1">
                  SPI 1A
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1B241F] text-[#1ED760] border border-[#2A352E] uppercase tracking-wider inline-block">
              Mahasiswa SPI 1A
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F7F5] leading-tight">
              {member.displayName}
            </h3>
            <p className="text-xs text-[#A7B0AA]">
              UIN Raden Mas Said Surakarta • Sejarah Peradaban Islam
            </p>

            {/* Share profile button */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs text-[#A7B0AA] hover:text-[#1ED760] pt-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan Profil
            </button>
          </div>
        </div>

        {/* Selected Song Banner */}
        <div className="p-4 rounded-2xl bg-[#1B241F] border border-[#2A352E] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0B0F0D] shrink-0 border border-[#2A352E]">
              <img
                src={member.albumArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80'}
                alt={member.songTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1ED760] flex items-center gap-1">
                <Music className="w-3 h-3" /> Lagu Pilihan
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[#F5F7F5] truncate">
                {member.songTitle}
              </h4>
              <p className="text-xs text-[#A7B0AA] truncate">{member.artistName}</p>
            </div>
          </div>

          {/* Audio Play Button */}
          {hasAudio ? (
            <button
              onClick={handlePlay}
              className={`p-3 rounded-full shrink-0 shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isCurrentPlaying
                  ? 'bg-[#1ED760] text-[#0B0F0D]'
                  : 'bg-[#1ED760] hover:bg-[#1ED760]/90 text-[#0B0F0D]'
              }`}
              title={isCurrentPlaying ? 'Jeda lagu' : isFull ? 'Putar lagu versi lengkap' : 'Putar lagu'}
            >
              {isCurrentPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          ) : (
            <span className="text-[11px] text-[#A7B0AA] italic">Audio tidak tersedia</span>
          )}
        </div>

        {/* Personal Message / Story */}
        <div className="p-4 rounded-2xl bg-[#0B0F0D] border border-[#2A352E] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1ED760]">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Cerita & Makna Lagu Bagi Mahasiswa</span>
          </div>
          <p className="text-xs sm:text-sm text-[#F5F7F5] leading-relaxed italic">
            “{member.personalMessage || 'Belum ada catatan khusus untuk lagu ini. Nikmati lagunya bersama teman-teman SPI 1A!' }”
          </p>
        </div>

        {/* Official Music Link if available */}
        {member.trackUrl && (
          <div className="flex justify-end">
            <a
              href={member.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#A7B0AA] hover:text-[#1ED760] transition-colors"
            >
              Dengarkan versi penuh di Apple Music
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Action Buttons for Owner */}
        {isOwner && (
          <div className="pt-3 border-t border-[#2A352E] flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus profil lagu ini dari playlist kelas?')) {
                  onDelete(member.id);
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Lagu Saya
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="px-5 py-2 rounded-xl bg-[#1ED760] hover:bg-[#1ED760]/90 text-[#0B0F0D] text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#1ED760]/20 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profil Saya
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
