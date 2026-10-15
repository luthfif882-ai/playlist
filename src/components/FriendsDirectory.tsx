import React from 'react';
import { Play, Pause, User, Music, Sparkles } from 'lucide-react';
import { MemberProfile, PlayerQueueItem } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface FriendsDirectoryProps {
  members: MemberProfile[];
  loading: boolean;
  onOpenProfile: (member: MemberProfile) => void;
  onAddSong: () => void;
}

export const FriendsDirectory: React.FC<FriendsDirectoryProps> = ({
  members,
  loading,
  onOpenProfile,
  onAddSong,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, queue } = usePlayer();

  const handlePlayCard = (e: React.MouseEvent, member: MemberProfile) => {
    e.stopPropagation();
    const hasAudio = !!member.youtubeId || !!member.fullAudioUrl || !!member.previewUrl;
    if (!hasAudio) {
      onOpenProfile(member);
      return;
    }

    const item: PlayerQueueItem = {
      memberId: member.id,
      studentName: member.displayName,
      songTitle: member.songTitle,
      artistName: member.artistName,
      albumArtwork: member.albumArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      previewUrl: member.previewUrl || '',
      fullAudioUrl: member.fullAudioUrl,
      youtubeId: member.youtubeId,
      isFullTrack: !!member.youtubeId || !!member.isFullTrack || !!member.fullAudioUrl,
      trackUrl: member.trackUrl,
    };

    if (currentTrack?.memberId === member.id) {
      togglePlay();
    } else {
      playTrack(item);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141A17] p-5 rounded-2xl border border-[#2A352E]">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7F5] flex items-center gap-2">
            <User className="w-5 h-5 text-[#1ED760]" />
            Direktori Mahasiswa SPI 1A
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B0AA] mt-1">
            Kenali teman sekelasmu melalui alunan lagu favorit dan cerita di baliknya.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-xs font-semibold text-[#1ED760] shrink-0">
          Total: {members.length} Mahasiswa
        </div>
      </div>

      {/* Grid of Friends Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-[#141A17] rounded-2xl p-4 border border-[#2A352E] space-y-4 animate-pulse"
            >
              <div className="w-full aspect-square bg-[#1B241F] rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-[#1B241F] rounded w-3/4" />
                <div className="h-3 bg-[#1B241F] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="py-16 text-center bg-[#141A17] rounded-2xl border border-[#2A352E] p-6 space-y-4">
          <Sparkles className="w-8 h-8 text-[#1ED760] mx-auto" />
          <h3 className="text-base font-semibold text-[#F5F7F5]">Belum ada teman terdaftar</h3>
          <p className="text-xs text-[#A7B0AA] max-w-sm mx-auto">
            Jadilah yang pertama menambahkan profil musikmu ke direktori kelas SPI 1A.
          </p>
          <button
            onClick={onAddSong}
            className="px-4 py-2 rounded-xl bg-[#1ED760] text-[#0B0F0D] font-bold text-xs"
          >
            Buat Profil Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {members.map((member) => {
            const hasAudio = !!member.fullAudioUrl || !!member.previewUrl;
            const isCardPlaying = isPlaying && currentTrack?.memberId === member.id;
            const isCardActive = currentTrack?.memberId === member.id;
            const isFull = !!member.isFullTrack || !!member.fullAudioUrl;

            return (
              <div
                key={member.id}
                onClick={() => onOpenProfile(member)}
                className={`group relative bg-[#141A17] hover:bg-[#1B241F] rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isCardActive
                    ? 'border-[#1ED760]/60 shadow-lg shadow-[#1ED760]/10'
                    : 'border-[#2A352E] hover:border-[#145A43]'
                }`}
              >
                {/* Top Section: Photo (1:1 ratio) & Play button overlay */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#0B0F0D] border border-[#2A352E] mb-3.5">
                  {member.photoURL ? (
                    <img
                      src={member.photoURL}
                      alt={member.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#145A43] to-[#1B241F] text-[#F5F7F5] p-4 text-center">
                      <span className="text-4xl font-extrabold text-[#1ED760] mb-1">
                        {member.displayName.charAt(0)}
                      </span>
                      <span className="text-[11px] text-[#A7B0AA] uppercase tracking-wider font-semibold">
                        SPI 1A
                      </span>
                    </div>
                  )}

                  {/* Album art badge on bottom right of photo */}
                  {member.albumArtwork && (
                    <div
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-lg overflow-hidden border-2 border-[#0B0F0D] shadow-md shadow-black/60"
                      title={`${member.songTitle} - ${member.artistName}`}
                    >
                      <img
                        src={member.albumArtwork}
                        alt="Album art"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Equalizer animation badge if playing */}
                  {isCardPlaying && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[#0B0F0D]/80 backdrop-blur-sm border border-[#1ED760]/40 flex items-center gap-1.5">
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-1" />
                        <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-2" />
                        <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-3" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#1ED760]">
                        {isFull ? 'Full Song' : 'Playing'}
                      </span>
                    </div>
                  )}

                  {/* Play audio button floating */}
                  {hasAudio && (
                    <button
                      onClick={(e) => handlePlayCard(e, member)}
                      className={`absolute bottom-2 left-2 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all ${
                        isCardPlaying
                          ? 'bg-[#1ED760] text-[#0B0F0D] scale-100'
                          : 'bg-[#1ED760] text-[#0B0F0D] opacity-90 sm:opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                      }`}
                      title={isCardPlaying ? 'Jeda lagu' : isFull ? 'Putar lagu versi lengkap' : 'Putar lagu'}
                    >
                      {isCardPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Middle Section: Student Name & Song Info */}
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-[#F5F7F5] truncate group-hover:text-[#1ED760] transition-colors">
                    {member.displayName}
                  </h4>

                  <div className="flex items-start gap-1.5 text-xs text-[#A7B0AA]">
                    <Music className="w-3.5 h-3.5 text-[#1ED760] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-[#F5F7F5] truncate">{member.songTitle}</p>
                      <p className="text-[11px] text-[#A7B0AA] truncate">{member.artistName}</p>
                    </div>
                  </div>

                  {member.personalMessage && (
                    <p className="text-xs text-[#A7B0AA]/80 line-clamp-2 italic pt-1">
                      “{member.personalMessage}”
                    </p>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-3 mt-3 border-t border-[#2A352E]/60 flex items-center justify-between text-xs">
                  <span className="text-[#A7B0AA] text-[11px]">Mahasiswa SPI 1A</span>
                  <span className="text-[#1ED760] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Lihat Profil &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
