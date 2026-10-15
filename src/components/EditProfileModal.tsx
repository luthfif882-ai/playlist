import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Music,
  Check,
  AlertCircle,
  Play,
  Pause,
  Loader2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { MemberProfile, MusicTrackResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { searchSongs } from '../services/musicApi';
import { uploadProfilePhoto, saveMemberProfile } from '../services/memberService';
import confetti from 'canvas-confetti';

interface EditProfileModalProps {
  initialData?: MemberProfile | null;
  onClose: () => void;
  onSuccess: (saved: boolean) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  initialData,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Form states
  const [displayName, setDisplayName] = useState(
    initialData?.displayName || user?.displayName || ''
  );
  const [photoURL, setPhotoURL] = useState(
    initialData?.photoURL || user?.photoURL || ''
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    initialData?.photoURL || user?.photoURL || ''
  );

  // Song selection states
  const [songTitle, setSongTitle] = useState(initialData?.songTitle || '');
  const [artistName, setArtistName] = useState(initialData?.artistName || '');
  const [albumArtwork, setAlbumArtwork] = useState(initialData?.albumArtwork || '');
  const [previewUrl, setPreviewUrl] = useState(initialData?.previewUrl || '');
  const [fullAudioUrl, setFullAudioUrl] = useState(initialData?.fullAudioUrl || '');
  const [isFullTrack, setIsFullTrack] = useState<boolean>(
    initialData?.isFullTrack !== undefined ? initialData.isFullTrack : true
  );
  const [trackUrl, setTrackUrl] = useState(initialData?.trackUrl || '');
  const [songId, setSongId] = useState(initialData?.songId || '');
  const [durationMs, setDurationMs] = useState<number>(initialData?.durationMs || 240000);

  // Personal message
  const [personalMessage, setPersonalMessage] = useState(initialData?.personalMessage || '');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicTrackResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form execution states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // In-form preview audio
  const [testPlayingUrl, setTestPlayingUrl] = useState<string | null>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
      }
    };
  }, []);

  const handleTestAudio = (url: string) => {
    if (!url) return;
    if (testPlayingUrl === url) {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
      }
      setTestPlayingUrl(null);
    } else {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
      }
      const audio = new Audio(url);
      testAudioRef.current = audio;
      audio.play().then(() => setTestPlayingUrl(url)).catch(() => {});
      audio.onended = () => setTestPlayingUrl(null);
    }
  };

  // Live Song Search using iTunes Search API
  const handleSearchSong = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchSongs(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('Lagu tidak ditemukan. Coba kata kunci atau nama penyanyi lain.');
      }
    } catch (err: any) {
      setSearchError('Gagal mencari lagu. Periksa koneksi internet Anda.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select song from search results
  const handleSelectSong = (track: MusicTrackResult) => {
    setSongTitle(track.trackName);
    setArtistName(track.artistName);
    setAlbumArtwork(track.artworkUrl600 || track.artworkUrl100);
    setPreviewUrl(track.previewUrl || '');
    setTrackUrl(track.trackViewUrl || '');
    setSongId(String(track.trackId));
    setDurationMs(track.trackTimeMillis || 30000);

    // Stop test audio if running
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      setTestPlayingUrl(null);
    }
  };

  // Photo selection & preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('File harus berupa format gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran file foto maksimal 5 MB.');
      return;
    }

    setPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    setFormError(null);
  };

  // Avatar presets for SPI students
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  ];

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFormError('Anda harus login terlebih dahulu.');
      return;
    }

    if (!displayName.trim() || displayName.trim().length < 2) {
      setFormError('Nama lengkap minimal 2 karakter.');
      return;
    }

    if (!songTitle.trim() || !artistName.trim()) {
      setFormError('Pilihlah satu lagu favorit dari pencarian lagu di bawah.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      let finalPhotoURL = photoURL;

      // Upload new photo to Firebase Storage if a file was picked
      if (photoFile) {
        try {
          finalPhotoURL = await uploadProfilePhoto(user.uid, photoFile);
        } catch (storageErr: any) {
          console.warn('Storage upload notice, falling back to preview URL:', storageErr);
          // If storage bucket isn't active on free tier, keep photoPreview or preset
          finalPhotoURL = photoPreview || photoURL;
        }
      }

      await saveMemberProfile(
        {
          uid: user.uid,
          displayName: displayName.trim(),
          photoURL: finalPhotoURL,
          songId,
          songTitle: songTitle.trim(),
          artistName: artistName.trim(),
          albumArtwork,
          previewUrl,
          fullAudioUrl: isFullTrack ? fullAudioUrl.trim() : '',
          isFullTrack: isFullTrack,
          trackUrl,
          durationMs: isFullTrack ? 240000 : durationMs,
          personalMessage: personalMessage.trim(),
        },
        !!initialData
      );

      // Celebrate!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onSuccess(true);
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setFormError(
        err?.message || 'Gagal menyimpan profil ke Firestore. Periksa koneksi internet.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#141A17] border border-[#2A352E] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A352E]">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#F5F7F5] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1ED760]" />
              {initialData ? 'Edit Profil Musik Saya' : 'Buat Profil Musik SPI 1A'}
            </h3>
            <p className="text-xs text-[#A7B0AA] mt-0.5">
              Bagikan lagu yang mendefinisikan ceritamu di kelas Sejarah Peradaban Islam 1A.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1B241F] text-[#A7B0AA] hover:text-[#F5F7F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Data Diri */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1ED760]">
              1. Identitas Mahasiswa
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Photo Preview & Upload */}
              <div className="sm:col-span-4 flex flex-col items-center gap-2">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-[#0B0F0D] border-2 border-[#2A352E] group">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#A7B0AA] p-2 text-center">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-[10px]">Belum ada foto</span>
                    </div>
                  )}
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-medium cursor-pointer transition-opacity"
                  >
                    <Upload className="w-4 h-4 mb-1 text-[#1ED760]" />
                    Ganti Foto
                  </label>
                </div>

                <input
                  id="photo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                <label
                  htmlFor="photo-upload"
                  className="text-xs text-[#1ED760] hover:underline cursor-pointer font-medium"
                >
                  Unggah dari HP / Laptop
                </label>
              </div>

              {/* Name & Preset Avatars */}
              <div className="sm:col-span-8 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7F5] mb-1.5">
                    Nama Lengkap Mahasiswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Muhammad Ilham"
                    maxLength={100}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-sm text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760]"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-[#A7B0AA] block mb-1.5">
                    Atau pilih avatar mahasiswa default:
                  </span>
                  <div className="flex items-center gap-2">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhotoURL(preset);
                          setPhotoPreview(preset);
                          setPhotoFile(null);
                        }}
                        className={`w-8 h-8 rounded-full overflow-hidden border transition-all ${
                          photoPreview === preset
                            ? 'border-[#1ED760] scale-110 shadow-md shadow-[#1ED760]/30'
                            : 'border-[#2A352E] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pemilihan Lagu via iTunes Search */}
          <div className="space-y-3 pt-2 border-t border-[#2A352E]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1ED760]">
              2. Cari & Pilih Lagu Favorit (iTunes Legal API)
            </h4>

            {/* Current Selected Song card if any */}
            {songTitle && (
              <div className="p-3.5 rounded-2xl bg-[#1B241F] border border-[#1ED760]/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0B0F0D] shrink-0 border border-[#2A352E]">
                    <img
                      src={albumArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
                      alt={songTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#1ED760] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" /> Lagu Terpilih
                    </span>
                    <p className="text-sm font-bold text-[#F5F7F5] truncate">{songTitle}</p>
                    <p className="text-xs text-[#A7B0AA] truncate">{artistName}</p>
                  </div>
                </div>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => handleTestAudio(previewUrl)}
                    className="p-2.5 rounded-full bg-[#1ED760] text-[#0B0F0D] hover:bg-[#1ED760]/90 transition-transform active:scale-95 shrink-0"
                    title="Uji dengar preview"
                  >
                    {testPlayingUrl === previewUrl ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Search Box */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0AA]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSong();
                    }
                  }}
                  placeholder="Ketik judul lagu atau penyanyi (mis: Tulus, Hindia, Coldplay)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-sm text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSearchSong()}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#145A43] hover:bg-[#145A43]/80 disabled:opacity-50 text-[#F5F7F5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Cari
              </button>
            </div>

            {searchError && (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                {searchError}
              </p>
            )}

            {/* Search Results Drawer */}
            {searchResults.length > 0 && (
              <div className="border border-[#2A352E] rounded-2xl bg-[#0B0F0D] max-h-56 overflow-y-auto divide-y divide-[#2A352E]/50 p-1">
                {searchResults.map((track) => (
                  <div
                    key={track.trackId}
                    className="p-2.5 hover:bg-[#141A17] rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div
                      onClick={() => handleSelectSong(track)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={track.artworkUrl100}
                        alt={track.trackName}
                        className="w-10 h-10 rounded-lg object-cover bg-[#1B241F] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F5F7F5] truncate">
                          {track.trackName}
                        </p>
                        <p className="text-[11px] text-[#A7B0AA] truncate">{track.artistName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {track.previewUrl && (
                        <button
                          type="button"
                          onClick={() => handleTestAudio(track.previewUrl!)}
                          className="p-1.5 rounded-lg bg-[#1B241F] hover:bg-[#2A352E] text-[#A7B0AA] hover:text-[#1ED760] transition-colors"
                          title="Dengar preview"
                        >
                          {testPlayingUrl === track.previewUrl ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectSong(track)}
                        className="px-3 py-1.5 rounded-lg bg-[#1ED760] text-[#0B0F0D] text-xs font-bold hover:bg-[#1ED760]/90 transition-colors"
                      >
                        Pilih
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2B: Format Musik (Full Song / Preview) */}
          <div className="space-y-3 pt-2 border-t border-[#2A352E]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1ED760] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                Format Pemutaran Musik
              </h4>
              <span className="text-[10px] text-[#A7B0AA]">
                Pilih versi penuh atau preview
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsFullTrack(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isFullTrack
                    ? 'bg-[#145A43] text-[#1ED760] border-[#1ED760]'
                    : 'bg-[#1B241F] text-[#A7B0AA] border-[#2A352E] hover:text-[#F5F7F5]'
                }`}
              >
                <span>Lagu Versi Penuh (Full Song)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullTrack(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  !isFullTrack
                    ? 'bg-[#145A43] text-[#1ED760] border-[#1ED760]'
                    : 'bg-[#1B241F] text-[#A7B0AA] border-[#2A352E] hover:text-[#F5F7F5]'
                }`}
              >
                <span>Cuplikan Preview 30s (iTunes)</span>
              </button>
            </div>

            {isFullTrack && (
              <div className="p-3.5 rounded-xl bg-[#1B241F] border border-[#2A352E] space-y-2">
                <label className="block text-xs font-semibold text-[#F5F7F5]">
                  Link Audio Lagu Lengkap (MP3 / Audio Stream)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={fullAudioUrl}
                    onChange={(e) => setFullAudioUrl(e.target.value)}
                    placeholder="https://contoh.com/lagu-full.mp3 atau link audio online..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0B0F0D] border border-[#2A352E] text-xs text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760]"
                  />
                  {fullAudioUrl && (
                    <button
                      type="button"
                      onClick={() => handleTestAudio(fullAudioUrl)}
                      className="px-3 py-2 rounded-lg bg-[#145A43] hover:bg-[#145A43]/80 text-[#1ED760] text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      {testPlayingUrl === fullAudioUrl ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Uji
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#A7B0AA]">
                  *Masukkan link direct MP3 atau streaming audio legal untuk diputar penuh oleh teman sekelas tanpa batasan 30 detik. Jika dikosongkan, sistem menggunakan stream preview otomatis.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Pesan Personal */}
          <div className="space-y-2 pt-2 border-t border-[#2A352E]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1ED760]">
              3. Cerita Singkat / Pesan Personal
            </h4>
            <textarea
              rows={3}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Ceritakan mengapa lagu ini berharga atau berikan pesan hangat untuk teman-teman sekelas SPI 1A..."
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-sm text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760] resize-none"
            />
            <div className="flex justify-between text-[11px] text-[#A7B0AA]">
              <span>Bisa berupa kata-kata penyemangat kuliah atau kenangan kelas</span>
              <span>{personalMessage.length}/500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#2A352E] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1B241F] hover:bg-[#2A352E] text-[#A7B0AA] hover:text-[#F5F7F5] text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#1ED760] hover:bg-[#1ED760]/90 text-[#0B0F0D] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#1ED760]/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan ke Firestore...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Simpan Profil Musik
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
