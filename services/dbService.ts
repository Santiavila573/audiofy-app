const DB_NAME = 'AudiofyDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error al abrir IndexedDB.');
      reject('Error al abrir la BD');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveAudio = async (id: string, file: File | Blob): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, file });

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error(`Error al guardar audio en IndexedDB para id: ${id}`, request.error);
        reject(request.error);
    }
  });
};

export const getAudio = async (id: string): Promise<File | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.file);
      } else {
        resolve(undefined);
      }
    };
    request.onerror = () => {
        console.error(`Error al obtener audio de IndexedDB para id: ${id}`, request.error);
        reject(request.error);
    }
  });
};