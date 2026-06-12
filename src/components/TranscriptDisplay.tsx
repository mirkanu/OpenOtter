"use client";

import { TranscriptUtterance } from "@/lib/types";

interface TranscriptDisplayProps {
  utterances: TranscriptUtterance[];
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getSpeakerColor(speaker: string): string {
  const colors = [
    "bg-indigo-100 text-indigo-800",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
    "bg-cyan-100 text-cyan-800",
    "bg-violet-100 text-violet-800",
    "bg-pink-100 text-pink-800",
    "bg-teal-100 text-teal-800",
    "bg-orange-100 text-orange-800",
    "bg-lime-100 text-lime-800",
  ];
  // Extract number or use hash of string for non-numeric speakers
  const numericPart = speaker.replace(/\D/g, "");
  const index = numericPart
    ? parseInt(numericPart) - 1
    : speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return colors[Math.abs(index) % colors.length] || colors[0];
}

export default function TranscriptDisplay({ utterances }: TranscriptDisplayProps) {
  if (utterances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transcript available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {utterances.map((utterance, index) => (
        <div
          key={index}
          className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
        >
          <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${getSpeakerColor(utterance.speaker)}`}>
            {utterance.speaker}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {utterance.text}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTime(utterance.start)} - {formatTime(utterance.end)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
