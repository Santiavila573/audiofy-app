import { MOCK_AUDIO_CONTENT, MOCK_PLAYLISTS, MOCK_USER } from '../constants';
import { AudioContent, Playlist, UserProfile, ListeningProgress, ContentType } from '../types';
import { saveAudio as saveAudioInDB } from './dbService';

const KEYS = {
  USER: 'audiofy-user',
  CONTENT: 'audiofy-content',
  PLAYLISTS: 'audiofy-playlists',
  PROGRESS: 'audiofy-progress',
  INITIALIZED: 'audiofy-initialized',
  SETTINGS: 'audiofy-settings',
  FAVORITES: 'audiofy-favorites',
};

export const toggleFavorite = (contentId: string): void => {
  const favorites = getFavorites();
  const index = favorites.indexOf(contentId);
  if (index === -1) {
    favorites.push(contentId);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
  window.dispatchEvent(new Event('storageUpdated'));
};

export const getFavorites = (): string[] => {
  const favorites = localStorage.getItem(KEYS.FAVORITES);
  return favorites ? JSON.parse(favorites) : [];
};

export const isFavorite = (contentId: string): boolean => {
  return getFavorites().includes(contentId);
};

export const initializeMockData = async () => {
  if (localStorage.getItem(KEYS.INITIALIZED)) {
    return;
  }

  console.log("Inicializando metadatos de ejemplo por primera vez...");

  localStorage.setItem(KEYS.USER, JSON.stringify(MOCK_USER));
  localStorage.setItem(KEYS.CONTENT, JSON.stringify(MOCK_AUDIO_CONTENT));
  localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(MOCK_PLAYLISTS));
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify({}));

  // Se eliminó la lógica de descarga de audios de ejemplo.
  // El reproductor ahora hará streaming de estos audios directamente desde su audioUrl.
  // Solo el contenido subido por el usuario se guardará en IndexedDB.

  localStorage.setItem(KEYS.INITIALIZED, 'true');
  console.log("Metadatos de ejemplo inicializados.");
};


// Generic getter/setter can be added for DRY principle
export const getUserProfile = (): UserProfile | null => {
  const user = localStorage.getItem(KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const getAllContent = (): AudioContent[] => {
  const content = localStorage.getItem(KEYS.CONTENT);
  return content ? JSON.parse(content) : [];
};

export const addContent = (newContent: AudioContent): void => {
  const allContent = getAllContent();
  allContent.unshift(newContent); // Add to the beginning of the list
  localStorage.setItem(KEYS.CONTENT, JSON.stringify(allContent));
};

export const getContentById = (id: string): AudioContent | undefined => {
  return getAllContent().find(item => item.id === id);
};

export const getAllPlaylists = (): Playlist[] => {
  const playlists = localStorage.getItem(KEYS.PLAYLISTS);
  return playlists ? JSON.parse(playlists) : [];
};

export const getPlaylistById = (id: string): Playlist | undefined => {
  return getAllPlaylists().find(p => p.id === id);
};

export const getListeningProgress = (): ListeningProgress => {
  const progress = localStorage.getItem(KEYS.PROGRESS);
  return progress ? JSON.parse(progress) : {};
}

export const saveListeningProgress = (contentId: string, progress: number) => {
  const allProgress = getListeningProgress();
  allProgress[contentId] = {
    progress,
    lastListened: Date.now()
  };
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(allProgress));
}

export interface PlayerSettings {
  volume: number;
  playbackRate: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  quality: 'low' | 'medium' | 'high';
}

export const getPlayerSettings = (): PlayerSettings => {
  const settings = localStorage.getItem(KEYS.SETTINGS);
  return settings ? JSON.parse(settings) : {
    volume: 1,
    playbackRate: 1,
    shuffle: false,
    repeat: 'off' as const,
    quality: 'high' as const,
  };
};

export const savePlayerSettings = (settings: Partial<PlayerSettings>) => {
  const currentSettings = getPlayerSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updatedSettings));
};

export const initializeLocalAudios = async () => {
  const audioFiles = [
    '+1 HORA de MOTIVACIÓN MILITAR NAVY SEAL\'S _ Piensa como las personas más fuertes del mundo!.mp3',
    '4 HISTORIAS de TERROR JAMÁS CONTADAS de TRAILEROS Vol. XIII.mp3',
    '6 HÁBITOS QUE LAS PERSONAS RICAS DESARROLLAN PARA VOLVERSE RICAS LO MÁS RÁPIDO POSIBLE.mp3',
    '6 Señales de Personas Demasiado Inteligentes.mp3',
    '7 Cosas En Las Que Nunca Deberías Malgastar Tu Vida.mp3',
    '12 Señales INQUIETANTES y exactas de que acabas de conocer a un HOMBRE SIGMA de VERDAD.mp3'
  ];

  const existingContent = getAllContent();
  const localAudios = existingContent.filter(item => item.id.startsWith('local-audio-'));

  if (localAudios.length >= audioFiles.length) {
    console.log("Audios locales ya inicializados.");
    return;
  }

  console.log("Inicializando audios locales desde assets/audios/ ...");

  for (const fileName of audioFiles) {
    const id = `local-audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const filePath = `/assets/audios/${fileName}`;

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`No se pudo cargar el archivo: ${fileName}`);
        continue;
      }
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const duration = await getAudioDuration(file);

      const newContent: AudioContent = {
        id,
        title: fileName.replace(/\.mp3$/, ''),
        author: 'Desconocido',
        description: `Audiolibro local: ${fileName}`,
        type: ContentType.Audiobook,
        coverArt: 'https://picsum.photos/seed/placeholder/400/400',
        duration,
        genre: ['Local'],
      };

      await saveAudioInDB(id, file);
      addContent(newContent);

      console.log(`Audio local añadido: ${fileName}`);
    } catch (error) {
      console.error(`Error al procesar ${fileName}:`, error);
    }
  }

  window.dispatchEvent(new Event('storageUpdated'));
  console.log("Audios locales inicializados.");
};

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      window.URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    };
    audio.src = window.URL.createObjectURL(file);
  });
};
