export interface MemberProfile {
  id: string; // Firestore document ID (matches uid)
  uid: string;
  displayName: string;
  photoURL?: string;
  songId?: string;
  songTitle: string;
  artistName: string;
  albumArtwork?: string;
  previewUrl?: string;
  fullAudioUrl?: string;
  youtubeId?: string;
  isFullTrack?: boolean;
  trackUrl?: string;
  durationMs?: number;
  personalMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassMember {
  id?: string;
  uid?: string;
  displayName: string;
  nim?: string;
  status: 'active' | 'joined' | 'invited';
  joinedAt?: string;
}

export interface MusicTrackResult {
  trackId: number | string;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  artworkUrl600?: string;
  previewUrl?: string;
  fullAudioUrl?: string;
  trackViewUrl?: string;
  collectionName?: string;
  trackTimeMillis?: number;
}

export type ConnectionStatus = 'connecting' | 'online' | 'saving' | 'synced' | 'offline' | 'error';

export interface PlayerQueueItem {
  memberId: string;
  studentName: string;
  songTitle: string;
  artistName: string;
  albumArtwork: string;
  previewUrl: string;
  fullAudioUrl?: string;
  youtubeId?: string;
  isFullTrack?: boolean;
  trackUrl?: string;
  durationSec?: number;
}
