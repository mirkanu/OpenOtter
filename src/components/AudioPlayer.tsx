"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface AudioPlayerRef {
  seekTo: (time: number) => void;
}

interface AudioPlayerProps {
  audioUrl: string; // proxy URL, e.g. /api/audio/{id}
  onTimeUpdate?: (currentTime: number) => void;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2];

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ audioUrl, onTimeUpdate }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playbackRate, setPlaybackRate] = useState(1);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (audioRef.current) {
          audioRef.current.currentTime = time / 1000; // Convert ms to seconds
        }
      },
    }));

    const handleTimeUpdate = () => {
      if (audioRef.current && onTimeUpdate) {
        onTimeUpdate(audioRef.current.currentTime * 1000); // Convert to ms
      }
    };

    const handleRateChange = (rate: number) => {
      if (audioRef.current) {
        audioRef.current.playbackRate = rate;
        setPlaybackRate(rate);
      }
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          className="w-full mb-3"
          onTimeUpdate={handleTimeUpdate}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Speed:</span>
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                playbackRate === rate
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
