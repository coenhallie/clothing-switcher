/**
 * Utility to wait for Tauri to be ready
 * In Tauri v2, the __TAURI__ object may not be immediately available
 */

let tauriReadyPromise = null

export function waitForTauri(timeout = 5000) {
  // Return cached promise if already waiting
  if (tauriReadyPromise) {
    return tauriReadyPromise
  }
  
  // If Tauri is already available, resolve immediately
  if (typeof window !== 'undefined' && window.__TAURI__) {
    console.log('[TauriReady] Tauri is already available')
    return Promise.resolve(true)
  }
  
  // Otherwise, wait for it to become available
  tauriReadyPromise = new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkTauri = () => {
      if (typeof window !== 'undefined' && window.__TAURI__) {
        console.log('[TauriReady] Tauri became available')
        resolve(true)
        return
      }
      
      // Check if timeout exceeded
      if (Date.now() - startTime > timeout) {
        console.warn('[TauriReady] Timeout waiting for Tauri')
        resolve(false)
        return
      }
      
      // Check again in 50ms
      setTimeout(checkTauri, 50)
    }
    
    checkTauri()
  })
  
  return tauriReadyPromise
}

export function isTauriAvailable() {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined
}