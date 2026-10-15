import React from 'react';
import { Play, PlusCircle, Sparkles, Music, Users, Disc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

interface HeroSectionProps {
  memberCount: number;
  songCount: number;
  onExplorePlaylist: () => void;
  onAddSong: () => void;
  onPlayFirstTrack: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  memberCount,
  songCount,
  onExplorePlaylist,
  onAddSong,
  onPlayFirstTrack,
}) => {
  const { user } = useAuth();
  const { isPlaying } = usePlayer();

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-[#2A352E]/60">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#145A43]/20 via-[#1ED760]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B241F] border border-[#2A352E] text-xs font-semibold text-[#1ED760]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ruang Musik Sejarah Peradaban Islam 1A</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F7F5] leading-tight">
                SPI 1A <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1ED760] via-[#52e88a] to-[#145A43]">Music Room</span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-[#1ED760] italic">
                “One Class, Many Stories, One Playlist.”
              </p>
              <p className="text-sm sm:text-base text-[#A7B0AA] max-w-2xl leading-relaxed">
                Website playlist kolaboratif mahasiswa Sejarah Peradaban Islam kelas 1A UIN Raden Mas Said Surakarta.
                Koleksi selera musik, cerita di balik lagu, dan harmoni persahabatan kita dalam satu ruang dengar bersama.
              </p>
            </div>

            {/* Live Statistics Counter (Calculated from Firestore state) */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <div className="px-4 py-3 rounded-xl bg-[#141A17] border border-[#2A352E] flex items-center gap-3 min-w-[140px]">
                <div className="w-9 h-9 rounded-lg bg-[#145A43]/40 border border-[#145A43] flex items-center justify-center text-[#1ED760]">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-[#F5F7F5] leading-none">{memberCount}</p>
                  <p className="text-xs text-[#A7B0AA] mt-1">Mahasiswa</p>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl bg-[#141A17] border border-[#2A352E] flex items-center gap-3 min-w-[140px]">
                <div className="w-9 h-9 rounded-lg bg-[#145A43]/40 border border-[#145A43] flex items-center justify-center text-[#1ED760]">
                  <Music className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-[#F5F7F5] leading-none">{songCount}</p>
                  <p className="text-xs text-[#A7B0AA] mt-1">Lagu Terkurasi</p>
                </div>
              </div>

              {/* Soundwave equalizer indicator */}
              <div className="px-4 py-3 rounded-xl bg-[#141A17] border border-[#2A352E] flex items-center gap-3">
                <div className="flex items-end gap-1 h-6">
                  <span className={`w-1 bg-[#1ED760] rounded-full ${isPlaying ? 'animate-bar-1' : 'h-2'}`} />
                  <span className={`w-1 bg-[#1ED760] rounded-full ${isPlaying ? 'animate-bar-2' : 'h-4'}`} />
                  <span className={`w-1 bg-[#1ED760] rounded-full ${isPlaying ? 'animate-bar-3' : 'h-1'}`} />
                  <span className={`w-1 bg-[#1ED760] rounded-full ${isPlaying ? 'animate-bar-4' : 'h-3'}`} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#F5F7F5]">
                    {isPlaying ? 'Sedang Memutar' : 'Audio Player'}
                  </p>
                  <p className="text-[11px] text-[#A7B0AA]">Preview 30s iTunes</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExplorePlaylist}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1ED760] hover:bg-[#1ED760]/90 text-[#0B0F0D] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#1ED760]/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Jelajahi Playlist
              </button>

              <button
                onClick={onAddSong}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1B241F] hover:bg-[#2A352E] text-[#F5F7F5] font-semibold text-sm border border-[#2A352E] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#1ED760]" />
                {user ? 'Kelola Profil & Lagumu' : 'Tambahkan Lagumu'}
              </button>

              <button
                onClick={onPlayFirstTrack}
                title="Putar Lagu Pertama"
                className="p-3 rounded-xl bg-[#141A17] hover:bg-[#1B241F] text-[#1ED760] border border-[#2A352E] transition-all hidden sm:flex items-center justify-center cursor-pointer"
              >
                <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin-slow' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Vinyl / Album Cover Artwork */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 group">
              {/* Back Vinyl Record that slides out slightly */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-950 to-neutral-800 border-4 border-neutral-700 shadow-2xl flex items-center justify-center transition-all duration-700 ease-out transform ${
                  isPlaying ? 'translate-x-10 sm:translate-x-12 rotate-45' : 'group-hover:translate-x-8'
                }`}
              >
                {/* Grooves */}
                <div className="w-48 h-48 rounded-full border border-neutral-700/50 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-neutral-700/40 flex items-center justify-center">
                    {/* Vinyl Center Label */}
                    <div className="w-20 h-20 rounded-full bg-[#145A43] border-2 border-[#1ED760] flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[8px] font-bold text-[#1ED760] uppercase tracking-wider">SPI 1A</span>
                      <span className="text-[7px] text-[#F5F7F5]">33⅓ RPM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Front Sleeve Album Jacket */}
              <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-gradient-to-br from-[#145A43] via-[#1B241F] to-[#0B0F0D] p-5 shadow-2xl border border-[#2A352E] flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#1ED760] bg-[#0B0F0D]/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-[#1ED760]/20">
                    CLASS OF 2024
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1ED760] animate-ping" />
                    <span className="text-[10px] text-[#A7B0AA]">Live</span>
                  </div>
                </div>

                <div className="space-y-1.5 my-auto py-4">
                  <p className="text-xs uppercase tracking-wider text-[#A7B0AA]">Official Mixtape</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#F5F7F5] leading-tight">
                    SUARA MAHASISWA SPI 1A
                  </h3>
                  <p className="text-xs text-[#1ED760]">UIN Raden Mas Said Surakarta</p>
                </div>

                <div className="pt-2 border-t border-[#2A352E]/80 flex items-center justify-between text-[11px] text-[#A7B0AA]">
                  <span>23 Cerita & Melodi</span>
                  <span className="font-mono text-[#F5F7F5]">Vol. 1</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
