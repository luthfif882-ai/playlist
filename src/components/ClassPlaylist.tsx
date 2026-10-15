import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Search,
  User,
  Clock,
  Music,
  ArrowUpDown,
  ExternalLink,
  Volume2,
  Info,
} from 'lucide-react';
import { MemberProfile, PlayerQueueItem } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface ClassPlaylistProps {
  members: MemberProfile[];
  loading: boolean;
  onOpenProfile: (member: MemberProfile) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

type SortOption = 'newest' | 'student-asc' | 'student-desc' | 'song-asc' | 'artist-asc';

export const ClassPlaylist: React.FC<ClassPlaylistProps> = ({
  members,
  loading,
  onOpenProfile,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Convert member list into player queue
  const queueItems: PlayerQueueItem[] = useMemo(() => {
    return members
      .filter((m) => !!m.youtubeId || !!m.fullAudioUrl || !!m.previewUrl)
      .map((m) => ({
        memberId: m.id,
        studentName: m.displayName,
        songTitle: m.songTitle,
        artistName: m.artistName,
        albumArtwork: m.albumArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
        previewUrl: m.previewUrl || '',
        fullAudioUrl: m.fullAudioUrl,
        youtubeId: m.youtubeId,
        isFullTrack: !!m.youtubeId || !!m.isFullTrack || !!m.fullAudioUrl,
        trackUrl: m.trackUrl,
      }));
  }, [members]);

  // Available initial letters
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  // Filtering and sorting (pure client-side transformation)
  const filteredAndSorted = useMemo(() => {
    let result = [...members];

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.songTitle.toLowerCase().includes(q) ||
          m.artistName.toLowerCase().includes(q) ||
          m.displayName.toLowerCase().includes(q)
      );
    }

    // Filter by first letter of student's name
    if (selectedLetter !== 'ALL') {
      result = result.filter((m) =>
        m.displayName.trim().toUpperCase().startsWith(selectedLetter)
      );
    }

    // Sort order
    result.sort((a, b) => {
      switch (sortBy) {
        case 'student-asc':
          return a.displayName.localeCompare(b.displayName);
        case 'student-desc':
          return b.displayName.localeCompare(a.displayName);
        case 'song-asc':
          return a.songTitle.localeCompare(b.songTitle);
        case 'artist-asc':
          return a.artistName.localeCompare(b.artistName);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [members, searchQuery, selectedLetter, sortBy]);

  const handleTrackClick = (member: MemberProfile) => {
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
      playTrack(item, queueItems);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Controls Header */}
      <div className="bg-[#141A17] p-4 sm:p-5 rounded-2xl border border-[#2A352E] space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul lagu, penyanyi, atau nama teman..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-sm text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A7B0AA] hover:text-[#F5F7F5]"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#A7B0AA] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#1B241F] border border-[#2A352E] text-[#F5F7F5] text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#1ED760] cursor-pointer"
            >
              <option value="newest">Terbaru Ditambahkan</option>
              <option value="student-asc">Nama Teman (A - Z)</option>
              <option value="student-desc">Nama Teman (Z - A)</option>
              <option value="song-asc">Judul Lagu (A - Z)</option>
              <option value="artist-asc">Nama Penyanyi (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Alphabet Filter Scrollable Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs text-[#A7B0AA] font-semibold pr-2 shrink-0">Inisial:</span>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                selectedLetter === letter
                  ? 'bg-[#1ED760] text-[#0B0F0D]'
                  : 'bg-[#1B241F] text-[#A7B0AA] hover:text-[#F5F7F5] hover:bg-[#2A352E]'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Track List Container */}
      <div className="bg-[#141A17] rounded-2xl border border-[#2A352E] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-[#2A352E] text-xs font-bold text-[#A7B0AA] uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 sm:col-span-5">Judul & Penyanyi</div>
          <div className="col-span-4 sm:col-span-4">Mahasiswa SPI 1A</div>
          <div className="col-span-1 sm:col-span-2 text-right sm:text-center">
            <span className="hidden sm:inline">Aksi</span>
            <Clock className="w-3.5 h-3.5 inline sm:hidden" />
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="divide-y divide-[#2A352E]/50">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center animate-pulse">
                <div className="col-span-1 h-4 bg-[#1B241F] rounded mx-auto w-4" />
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1B241F]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-[#1B241F] rounded w-3/4" />
                    <div className="h-3 bg-[#1B241F] rounded w-1/2" />
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-4 h-3.5 bg-[#1B241F] rounded w-2/3" />
                <div className="col-span-1 sm:col-span-2 h-7 bg-[#1B241F] rounded-lg w-16 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAndSorted.length === 0 && (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1B241F] border border-[#2A352E] flex items-center justify-center text-[#A7B0AA] mx-auto">
              <Music className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-[#F5F7F5]">
              {searchQuery || selectedLetter !== 'ALL'
                ? 'Tidak ada lagu yang cocok dengan filter'
                : 'Belum ada lagu yang tersimpan'}
            </h4>
            <p className="text-xs text-[#A7B0AA] max-w-sm mx-auto">
              {searchQuery || selectedLetter !== 'ALL'
                ? 'Coba ganti kata kunci pencarian atau ubah inisial huruf nama.'
                : 'Jadilah orang pertama di kelas SPI 1A yang membagikan lagu favoritmu!'}
            </p>
          </div>
        )}

        {/* Playlist Rows */}
        {!loading && filteredAndSorted.length > 0 && (
          <div className="divide-y divide-[#2A352E]/40">
            {filteredAndSorted.map((member, index) => {
              const hasAudio = !!member.fullAudioUrl || !!member.previewUrl;
              const isCurrentPlaying = isPlaying && currentTrack?.memberId === member.id;
              const isCurrentSelected = currentTrack?.memberId === member.id;
              const isFull = !!member.isFullTrack || !!member.fullAudioUrl;

              return (
                <div
                  key={member.id}
                  className={`grid grid-cols-12 gap-3 px-4 py-3 items-center group transition-colors hover:bg-[#1B241F] ${
                    isCurrentSelected ? 'bg-[#1B241F]/90 text-[#1ED760]' : ''
                  }`}
                >
                  {/* Track Number / Play Trigger */}
                  <div className="col-span-1 text-center flex items-center justify-center">
                    <button
                      onClick={() => handleTrackClick(member)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer text-[#A7B0AA] hover:text-[#1ED760]"
                      title={hasAudio ? (isFull ? 'Putar lagu versi penuh' : 'Putar preview lagu') : 'Lihat profil'}
                    >
                      {isCurrentPlaying ? (
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-1" />
                          <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-2" />
                          <span className="w-0.5 bg-[#1ED760] rounded-full animate-bar-3" />
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden text-xs font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <Play className="w-4 h-4 fill-current hidden group-hover:block text-[#1ED760]" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Artwork + Title & Artist */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => handleTrackClick(member)}
                      className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#0B0F0D] border border-[#2A352E] cursor-pointer group/art"
                    >
                      <img
                        src={member.albumArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80'}
                        alt={member.songTitle}
                        className="w-full h-full object-cover group-hover/art:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Play overlay on art */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 flex items-center justify-center transition-opacity">
                        {isCurrentPlaying ? (
                          <Pause className="w-4 h-4 text-white fill-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p
                          onClick={() => handleTrackClick(member)}
                          className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                            isCurrentSelected ? 'text-[#1ED760]' : 'text-[#F5F7F5]'
                          }`}
                        >
                          {member.songTitle}
                        </p>
                        {isFull && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#145A43] text-[#1ED760] border border-[#1ED760]/40">
                            FULL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A7B0AA] truncate">{member.artistName}</p>
                    </div>
                  </div>

                  {/* Student Contributor */}
                  <div className="col-span-4 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <div
                      onClick={() => onOpenProfile(member)}
                      className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-[#145A43] border border-[#2A352E] cursor-pointer"
                    >
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={member.displayName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#F5F7F5]">
                          {member.displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenProfile(member)}
                      className="text-xs text-[#F5F7F5] hover:text-[#1ED760] font-medium truncate text-left cursor-pointer transition-colors"
                    >
                      {member.displayName}
                    </button>
                  </div>

                  {/* Action / Audio status */}
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-end sm:justify-center gap-2">
                    <button
                      onClick={() => onOpenProfile(member)}
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1B241F] hover:bg-[#2A352E] text-[#A7B0AA] hover:text-[#F5F7F5] border border-[#2A352E] transition-colors"
                      title="Lihat Cerita & Profil Lengkap"
                    >
                      <User className="w-3.5 h-3.5 text-[#1ED760]" />
                      Profil
                    </button>

                    {hasAudio ? (
                      <button
                        onClick={() => handleTrackClick(member)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isCurrentPlaying
                            ? 'bg-[#1ED760] text-[#0B0F0D] border-[#1ED760]'
                            : 'bg-[#1B241F] text-[#A7B0AA] hover:text-[#1ED760] border-[#2A352E]'
                        }`}
                        title={isCurrentPlaying ? 'Jeda lagu' : isFull ? 'Putar lagu versi lengkap' : 'Putar lagu'}
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                    ) : (
                      <span
                        title="Audio belum tersedia"
                        className="text-[10px] text-[#A7B0AA]/60 italic hidden sm:inline"
                      >
                        No audio
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
