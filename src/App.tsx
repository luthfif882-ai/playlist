/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ClassPlaylist } from './components/ClassPlaylist';
import { FriendsDirectory } from './components/FriendsDirectory';
import { ProfileModal } from './components/ProfileModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AuthModal } from './components/AuthModal';
import { GlobalPlayer } from './components/GlobalPlayer';
import { DocumentationTab } from './components/DocumentationTab';
import { MemberProfile, ConnectionStatus, PlayerQueueItem } from './types';
import { subscribeToMembers, deleteMemberProfile } from './services/memberService';
import { INITIAL_23_STUDENTS } from './data/initialStudents';
import { Sparkles, Heart, Disc3 } from 'lucide-react';

function MainAppContent() {
  const { user, myProfile, setMyProfile, openAuthModal } = useAuth();
  const { playTrack } = usePlayer();

  // App navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'playlist' | 'friends' | 'docs'>('home');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  // Members data state
  const [members, setMembers] = useState<MemberProfile[]>(INITIAL_23_STUDENTS);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<MemberProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to Firestore members collection
  useEffect(() => {
    setConnectionStatus('connecting');

    const unsubscribe = subscribeToMembers(
      (firestoreMembers) => {
        setConnectionStatus('online');
        setLoading(false);

        if (firestoreMembers.length > 0) {
          // Merge or prioritize live Firestore members with initial class list
          // Mapping by uid/id to prevent duplicates
          const memberMap = new Map<string, MemberProfile>();

          // Initial 23 students as fallback baseline
          INITIAL_23_STUDENTS.forEach((m) => memberMap.set(m.displayName.toLowerCase(), m));

          // Real user documents overwrite matching names or appear at the top
          firestoreMembers.forEach((fm) => {
            const key = fm.displayName.toLowerCase();
            const existing = memberMap.get(key);
            memberMap.set(key, {
              ...fm,
              youtubeId: fm.youtubeId || existing?.youtubeId,
              fullAudioUrl: fm.fullAudioUrl || existing?.fullAudioUrl,
              isFullTrack: !!fm.isFullTrack || !!fm.youtubeId || !!existing?.youtubeId || !!fm.fullAudioUrl,
              durationMs: fm.durationMs || existing?.durationMs || 240000,
            });
          });

          const combinedList = Array.from(memberMap.values()).sort((a, b) => {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });

          setMembers(combinedList);
        } else {
          // Default to initial 23 students
          setMembers(INITIAL_23_STUDENTS);
        }
      },
      (error) => {
        console.warn('Firestore subscription status:', error);
        setConnectionStatus('synced');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update current user's personal profile whenever members list changes
  useEffect(() => {
    if (user && members.length > 0) {
      const found = members.find((m) => m.uid === user.uid);
      setMyProfile(found || null);
    } else {
      setMyProfile(null);
    }
  }, [user, members, setMyProfile]);

  const handleOpenAddOrEdit = () => {
    if (!user) {
      openAuthModal();
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteProfile = async (memberId: string) => {
    try {
      setConnectionStatus('saving');
      await deleteMemberProfile(memberId);
      showToast('Profil lagu Anda berhasil dihapus.');
      setConnectionStatus('synced');
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus profil.');
      setConnectionStatus('online');
    }
  };

  const handleOpenProfileById = (memberId: string) => {
    const found = members.find((m) => m.id === memberId || m.uid === memberId);
    if (found) {
      setSelectedProfile(found);
    }
  };

  const handlePlayFirstTrack = () => {
    const firstWithAudio = members.find((m) => !!m.youtubeId || !!m.fullAudioUrl || !!m.previewUrl);
    if (firstWithAudio) {
      const item: PlayerQueueItem = {
        memberId: firstWithAudio.id,
        studentName: firstWithAudio.displayName,
        songTitle: firstWithAudio.songTitle,
        artistName: firstWithAudio.artistName,
        albumArtwork: firstWithAudio.albumArtwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
        previewUrl: firstWithAudio.previewUrl || '',
        fullAudioUrl: firstWithAudio.fullAudioUrl,
        youtubeId: firstWithAudio.youtubeId,
        isFullTrack: !!firstWithAudio.youtubeId || !!firstWithAudio.isFullTrack || !!firstWithAudio.fullAudioUrl,
        trackUrl: firstWithAudio.trackUrl,
      };
      playTrack(item);
      showToast(`Memutar Lagu Penuh: ${firstWithAudio.songTitle} - ${firstWithAudio.artistName}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F5F7F5] flex flex-col font-sans selection:bg-[#1ED760] selection:text-[#0B0F0D]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#145A43] text-[#F5F7F5] border border-[#1ED760]/40 text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#1ED760]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionStatus={connectionStatus}
        onOpenSearch={() => {
          setActiveTab('playlist');
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onOpenAddProfile={handleOpenAddOrEdit}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-32">
        {activeTab === 'home' && (
          <div className="space-y-12">
            <HeroSection
              memberCount={members.length}
              songCount={members.filter((m) => !!m.songTitle).length}
              onExplorePlaylist={() => setActiveTab('playlist')}
              onAddSong={handleOpenAddOrEdit}
              onPlayFirstTrack={handlePlayFirstTrack}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              {/* Highlight Playlist Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7F5]">
                      Lagu Terpopuler di SPI 1A
                    </h2>
                    <p className="text-xs sm:text-sm text-[#A7B0AA]">
                      Kompilasi lagu favorit yang dibagikan mahasiswa Sejarah Peradaban Islam.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('playlist')}
                    className="text-xs font-semibold text-[#1ED760] hover:underline"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>

                <ClassPlaylist
                  members={members.slice(0, 8)}
                  loading={loading}
                  onOpenProfile={(m) => setSelectedProfile(m)}
                  searchQuery=""
                  setSearchQuery={() => {}}
                />
              </div>

              {/* Friends Directory Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7F5]">
                      Teman Sekelas SPI 1A
                    </h2>
                    <p className="text-xs sm:text-sm text-[#A7B0AA]">
                      Sentuh foto profil untuk membaca cerita dan mendengarkan musik mereka.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="text-xs font-semibold text-[#1ED760] hover:underline"
                  >
                    Buka Direktori (23) &rarr;
                  </button>
                </div>

                <FriendsDirectory
                  members={members.slice(0, 6)}
                  loading={loading}
                  onOpenProfile={(m) => setSelectedProfile(m)}
                  onAddSong={handleOpenAddOrEdit}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'playlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5]">
                Playlist Kolaboratif Kelas
              </h1>
              <p className="text-xs sm:text-sm text-[#A7B0AA]">
                Semua lagu yang dikurasi oleh mahasiswa Sejarah Peradaban Islam 1A UIN RMS Surakarta.
              </p>
            </div>

            <ClassPlaylist
              members={members}
              loading={loading}
              onOpenProfile={(m) => setSelectedProfile(m)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <FriendsDirectory
              members={members}
              loading={loading}
              onOpenProfile={(m) => setSelectedProfile(m)}
              onAddSong={handleOpenAddOrEdit}
            />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <DocumentationTab />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A352E] bg-[#141A17] py-8 text-xs text-[#A7B0AA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-[#1ED760]" />
            <span className="font-semibold text-[#F5F7F5]">SPI 1A Music Room</span>
            <span>—</span>
            <span>UIN Raden Mas Said Surakarta</span>
          </div>

          <p className="flex items-center gap-1 text-[11px]">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 inline" /> untuk kelas SPI 1A
          </p>
        </div>
      </footer>

      {/* Global Sticky Audio Player */}
      <GlobalPlayer onOpenProfileById={handleOpenProfileById} />

      {/* Modals */}
      <AuthModal />

      {selectedProfile && (
        <ProfileModal
          member={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onEdit={(m) => {
            setSelectedProfile(null);
            setIsEditModalOpen(true);
          }}
          onDelete={(id) => handleDeleteProfile(id)}
        />
      )}

      {isEditModalOpen && (
        <EditProfileModal
          initialData={myProfile}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            showToast('Profil musik Anda berhasil disimpan ke Firestore!');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MainAppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}
