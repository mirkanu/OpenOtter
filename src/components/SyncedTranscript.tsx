"use client";

import { useState, useRef, useMemo } from 'react';
import AudioPlayer, { type AudioPlayerRef } from './AudioPlayer';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TranscriptUtterance } from '@/lib/types';

interface SyncedTranscriptProps {
  audioUrl: string; // proxy URL, e.g. /api/audio/{id}
  utterances: TranscriptUtterance[];
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Returns a hex color for use as inline style on Badge
function getSpeakerColor(speaker: string): string {
  const colors = [
    "#6366f1", // indigo
    "#10b981", // emerald
    "#f59e0b", // amber
    "#f43f5e", // rose
    "#06b6d4", // cyan
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#84cc16", // lime
  ];
  const numericPart = speaker.replace(/\D/g, "");
  const index = numericPart
    ? parseInt(numericPart) - 1
    : speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[Math.abs(index) % colors.length] || colors[0];
}

export default function SyncedTranscript({ audioUrl, utterances }: SyncedTranscriptProps) {
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const lastUpdateTime = useRef<number>(0);

  const handleTimeUpdate = (time: number) => {
    const now = Date.now();
    // Throttle updates to 100ms minimum to prevent excessive re-renders
    if (now - lastUpdateTime.current < 100) return;
    lastUpdateTime.current = now;
    setCurrentTime(time);
  };

  const handleClickUtterance = (startTime: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.seekTo(startTime);
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        audioElement.play();
      }
    }
  };

  // Memoize current utterance calculation
  const currentUtterance = useMemo(() => {
    return utterances.find(
      u => currentTime >= u.start && currentTime <= u.end
    );
  }, [currentTime, utterances]);

  if (utterances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transcript available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AudioPlayer
        ref={audioPlayerRef}
        audioUrl={audioUrl}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="space-y-3">
        {utterances.map((utterance, index) => {
          const isActive = currentUtterance === utterance;
          const speakerColor = getSpeakerColor(utterance.speaker);

          return (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors",
                isActive
                  ? "bg-accent border-l-4 border-primary"
                  : "bg-muted hover:bg-accent/50"
              )}
              onClick={() => handleClickUtterance(utterance.start)}
            >
              <Badge
                variant="outline"
                className="mb-2"
                style={{ backgroundColor: speakerColor, color: '#fff', borderColor: speakerColor }}
              >
                {utterance.speaker}
              </Badge>
              <p className="text-sm whitespace-pre-wrap">
                {utterance.text}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatTime(utterance.start)} - {formatTime(utterance.end)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
