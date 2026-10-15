import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PlayerQueueItem } from '../types';
import { resolveLivePreviewUrl } from '../services/musicApi';

interface PlayerContextType {
  currentTrack: PlayerQueueItem | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeat: boolean;
  isShuffle: boolean;
  queue: PlayerQueueItem[];
  activeEngine: 'audio' | 'youtube';
  youtubeVideoId: string | null;
  showVideoDrawer: boolean;
  setShowVideoDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  videoDisplayMode: 'mini' | 'expanded' | 'minimized';
  setVideoDisplayMode: React.Dispatch<React.SetStateAction<'mini' | 'expanded' | 'minimized'>>;
  playTrack: (track: PlayerQueueItem, newQueue?: PlayerQueueItem[]) => void;
  togglePlay: () => void;
  pause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setQueue: (queue: PlayerQueueItem[]) => void;
  audioError: string | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<PlayerQueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(240); // Standard full song ~4 min
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [queue, setQueue] = useState<PlayerQueueItem[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Full Song engine support: 'youtube' or 'audio'
  const [activeEngine, setActiveEngine] = useState<'audio' | 'youtube'>('youtube');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [showVideoDrawer, setShowVideoDrawer] = useState<boolean>(false);
  const [videoDisplayMode, setVideoDisplayMode] = useState<'mini' | 'expanded' | 'minimized'>('mini');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<PlayerQueueItem | null>(null);
  const queueRef = useRef<PlayerQueueItem[]>([]);
  const isRepeatRef = useRef<boolean>(false);
  const isShuffleRef = useRef<boolean>(false);
  const activeEngineRef = useRef<'audio' | 'youtube'>('youtube');

  // Sync refs
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    activeEngineRef.current = activeEngine;
  }, [activeEngine]);

  // Next track helper
  const playNextFromQueue = () => {
    const q = queueRef.current;
    if (!q || q.length === 0) return;

    const cur = currentTrackRef.current;
    const currentIndex = q.findIndex(
      (item) => item.memberId === cur?.memberId || item.previewUrl === cur?.previewUrl
    );

    let nextIndex = 0;
    if (isShuffleRef.current) {
      nextIndex = Math.floor(Math.random() * q.length);
    } else if (currentIndex !== -1) {
      nextIndex = (currentIndex + 1) % q.length;
    }

    const next = q[nextIndex];
    if (next) {
      playTrack(next);
    }
  };

  // Timer interval for YouTube / full track playback progress
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && activeEngine === 'youtube') {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (isRepeatRef.current) {
              return 0;
            } else {
              playNextFromQueue();
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, activeEngine, duration]);

  // Initialize single global HTML5 audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (activeEngineRef.current === 'audio') {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    const handleWaiting = () => {
      if (activeEngineRef.current === 'audio') setIsLoading(true);
    };

    const handleCanPlay = () => {
      if (activeEngineRef.current === 'audio') setIsLoading(false);
    };

    const handlePlaying = () => {
      if (activeEngineRef.current === 'audio') {
        setIsLoading(false);
        setIsPlaying(true);
        setAudioError(null);
      }
    };

    const handlePause = () => {
      if (activeEngineRef.current === 'audio') setIsPlaying(false);
    };

    const handleEnded = () => {
      if (activeEngineRef.current === 'audio') {
        setIsPlaying(false);
        setCurrentTime(0);
        if (isRepeatRef.current) {
          audio.currentTime = 0;
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
          playNextFromQueue();
        }
      }
    };

    const handleError = async () => {
      if (activeEngineRef.current !== 'audio') return;
      setIsLoading(false);
      setIsPlaying(false);
      const cur = currentTrackRef.current;
      if (!cur) return;

      console.warn(`Audio error for "${cur.songTitle}", falling back to full stream...`);
      if (cur.youtubeId) {
        setYoutubeVideoId(cur.youtubeId);
        setActiveEngine('youtube');
        setIsPlaying(true);
        setAudioError(null);
        return;
      }

      setAudioError(`Audio untuk "${cur.songTitle}" tidak dapat diputar.`);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playTrack = async (track: PlayerQueueItem, newQueue?: PlayerQueueItem[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    }

    // Toggle if same track
    if (currentTrack?.memberId === track.memberId && isPlaying) {
      togglePlay();
      return;
    }

    setAudioError(null);
    setCurrentTrack(track);
    setIsLoading(true);
    setCurrentTime(0);

    // Stop HTML5 audio before starting new track
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (_) {}
    }

    // Priority 1: Direct Full Audio Stream Link (MP3/M4A/uploaded audio)
    if (track.fullAudioUrl && audioRef.current) {
      setActiveEngine('audio');
      setYoutubeVideoId(null);
      try {
        audioRef.current.src = track.fullAudioUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        return;
      } catch (e) {
        console.warn('Direct audio playback error, falling back:', e);
      }
    }

    // Priority 2: Full Song via YouTube official video/audio (FULL LENGTH 3-5 minutes!)
    if (track.youtubeId) {
      setActiveEngine('youtube');
      setYoutubeVideoId(track.youtubeId);
      setVideoDisplayMode('mini');
      setDuration(track.durationSec || 240);
      setIsPlaying(true);
      setIsLoading(false);
      return;
    }

    // Priority 3: Fallback preview
    let targetUrl = track.previewUrl;
    if (!targetUrl) {
      targetUrl = await resolveLivePreviewUrl(track.songTitle, track.artistName);
    }

    if (targetUrl && audioRef.current) {
      setActiveEngine('audio');
      setYoutubeVideoId(null);
      try {
        audioRef.current.src = targetUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn('Preview playback error:', err);
      }
    }

    setIsLoading(false);
    setIsPlaying(false);
    setAudioError(`Audio belum tersedia untuk "${track.songTitle}".`);
  };

  const togglePlay = async () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      }
      return;
    }

    if (activeEngine === 'youtube') {
      setIsPlaying(!isPlaying);
      // Can postMessage to YouTube iframe
      const iframe = document.getElementById('yt-full-player-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        const cmd = isPlaying ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
        iframe.contentWindow.postMessage(cmd, '*');
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === window.location.href || audioRef.current.error) {
        playTrack(currentTrack);
        return;
      }
      try {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (err) {
        console.warn('Play error:', err);
        setIsLoading(false);
        playTrack(currentTrack);
      }
    }
  };

  const pause = () => {
    if (activeEngine === 'youtube') {
      setIsPlaying(false);
      const iframe = document.getElementById('yt-full-player-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    playNextFromQueue();
  };

  const prevTrack = () => {
    if (!queue.length) return;
    if (currentTime > 3) {
      setCurrentTime(0);
      if (audioRef.current && activeEngine === 'audio') {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const currentIndex = queue.findIndex(
      (item) => item.memberId === currentTrack?.memberId
    );

    let prevIndex = queue.length - 1;
    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    }

    const prev = queue[prevIndex];
    if (prev) {
      playTrack(prev);
    }
  };

  const seek = (time: number) => {
    if (!isNaN(time) && isFinite(time)) {
      setCurrentTime(time);
      if (audioRef.current && activeEngine === 'audio') {
        audioRef.current.currentTime = time;
      }
      if (activeEngine === 'youtube') {
        const iframe = document.getElementById('yt-full-player-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [time, true],
          }), '*');
        }
      }
    }
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (isMuted && clamped > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        isRepeat,
        isShuffle,
        queue,
        activeEngine,
        youtubeVideoId,
        showVideoDrawer,
        setShowVideoDrawer,
        videoDisplayMode,
        setVideoDisplayMode,
        playTrack,
        togglePlay,
        pause,
        nextTrack,
        prevTrack,
        seek,
        setVolumeLevel,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        setQueue,
        audioError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};
