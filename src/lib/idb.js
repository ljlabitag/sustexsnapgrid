const DB_NAME = "snap-grid-db";
const DB_VERSION = 1;
const PHOTO_STORE = "photos";
const META_STORE = "meta";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE); // key = cell index (string), value = dataURL
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE); // simple key-value store
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName, mode, runner) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const result = runner(store);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

// Photos
export async function setPhoto(index, dataURL) {
  return tx(PHOTO_STORE, "readwrite", store => store.put(dataURL, String(index)));
}

export async function getAllPhotos() {
  return tx(PHOTO_STORE, "readonly", store => {
    return new Promise((resolve, reject) => {
      const out = {};
      const req = store.openCursor();
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          out[cursor.key] = cursor.value;
          cursor.continue();
        } else {
          resolve(out);
        }
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function deletePhoto(index) {
  return tx(PHOTO_STORE, "readwrite", store => store.delete(String(index)));
}

export async function clearAllPhotos() {
  return tx(PHOTO_STORE, "readwrite", store => store.clear());
}

// Meta
export async function getMeta(key) {
  return tx(META_STORE, "readonly", store => {
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function setMeta(key, value) {
  return tx(META_STORE, "readwrite", store => store.put(value, key));
}
