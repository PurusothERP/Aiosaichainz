// MongoDB Atlas Client Sync Service for Aichainz ERP

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '/api'
  : '/api';

let syncTimeout: any = null;

/**
 * Fetch full ERP state from MongoDB Atlas
 */
export async function fetchERPDataFromMongo(): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/data`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('MongoDB Atlas fetch offline, relying on localStorage:', err);
    return null;
  }
}

/**
 * Sync full ERP state to MongoDB Atlas in real-time (debounced)
 */
export function syncERPDataToMongo(fullState: any) {
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(async () => {
    try {
      await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullState)
      });
      console.log('✅ Real-time state auto-saved to MongoDB Atlas!');
    } catch (err) {
      console.warn('MongoDB Atlas auto-save failed (offline mode):', err);
    }
  }, 1000);
}
