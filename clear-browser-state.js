/**
 * Clear All Browser State Script
 * 
 * Run this in the browser console to clear all cached state
 * that might be causing routing issues.
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. Refresh the page
 */

(async function clearAllBrowserState() {
  console.log('🧹 Starting browser state cleanup...\n');

  // 1. Unregister all service workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Unregistered service worker:', registration.scope);
      }
      if (registrations.length === 0) {
        console.log('ℹ️  No service workers to unregister');
      }
    } catch (error) {
      console.error('❌ Error unregistering service workers:', error);
    }
  }

  // 2. Clear localStorage
  try {
    const localStorageKeys = Object.keys(localStorage);
    localStorage.clear();
    console.log(`✅ Cleared localStorage (${localStorageKeys.length} items)`);
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
  }

  // 3. Clear sessionStorage
  try {
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorage.clear();
    console.log(`✅ Cleared sessionStorage (${sessionStorageKeys.length} items)`);
  } catch (error) {
    console.error('❌ Error clearing sessionStorage:', error);
  }

  // 4. Clear all caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log(`✅ Deleted cache: ${cacheName}`);
      }
      if (cacheNames.length === 0) {
        console.log('ℹ️  No caches to delete');
      }
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
    }
  }

  // 5. Clear IndexedDB (if any)
  if ('indexedDB' in window) {
    try {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
          console.log(`✅ Deleted IndexedDB: ${db.name}`);
        }
      }
      if (databases.length === 0) {
        console.log('ℹ️  No IndexedDB databases to delete');
      }
    } catch (error) {
      console.error('❌ Error clearing IndexedDB:', error);
    }
  }

  // 6. Clear cookies (for current domain)
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
    console.log(`✅ Cleared cookies (${cookies.length} items)`);
  } catch (error) {
    console.error('❌ Error clearing cookies:', error);
  }

  console.log('\n✨ Browser state cleanup complete!');
  console.log('📋 Summary:');
  console.log('  - Service workers: Unregistered');
  console.log('  - localStorage: Cleared');
  console.log('  - sessionStorage: Cleared');
  console.log('  - Caches: Deleted');
  console.log('  - IndexedDB: Deleted');
  console.log('  - Cookies: Cleared');
  console.log('\n🔄 Please refresh the page now (Ctrl+Shift+R for hard refresh)');
})();
