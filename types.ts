export enum ContentType {
    Audiobook = 'AUDIOBOOK',
    Podcast = 'PODCAST',
}

export interface AudioContent {
    id: string;
    title: string;
    author: string;
    description: string;
    type: ContentType;
    coverArt: string;
    duration: number; // in seconds
    genre: string[];
    narrator?: string;
    audioUrl?: string; // For streaming, but we are using local files via dbService
    lyrics?: LyricLine[]; // Array of lyric lines with timestamps
}

export interface LyricLine {
    time: number; // in seconds
    text: string;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    coverArt: string;
    items: string[]; // array of AudioContent ids
}

export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
}

export interface ListeningProgress {
    [contentId: string]: {
        progress: number; // in seconds
        lastListened: number; // timestamp
    };
}
