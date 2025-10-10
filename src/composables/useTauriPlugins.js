import { ref } from 'vue'

/**
 * Composable for using Tauri 2 plugins with graceful degradation for web browsers
 * Provides wrapper functions for notifications and dialogs
 */
export function useTauriPlugins() {
  const isTauri = ref(typeof window !== 'undefined' && window.__TAURI__ !== undefined)
  
  // Plugin function references
  let sendNotification, isPermissionGranted, requestPermission
  let messageDialog, confirmDialog, openDialog, saveDialog
  let triggerHapticFn
  
  // Track if plugins are initialized
  let pluginsInitialized = false
  let initPromise = null
  
  // Initialize plugins
  const initPlugins = async () => {
    if (pluginsInitialized || !isTauri.value) {
      return
    }
    
    if (initPromise) {
      return initPromise
    }
    
    initPromise = (async () => {
      try {
        const notification = await import('@tauri-apps/plugin-notification')
        sendNotification = notification.sendNotification
        isPermissionGranted = notification.isPermissionGranted
        requestPermission = notification.requestPermission
        console.log('[TauriPlugins] Notification plugin loaded successfully')
      } catch (err) {
        console.warn('[TauriPlugins] Notification plugin not available:', err)
      }
      
      try {
        const dialog = await import('@tauri-apps/plugin-dialog')
        messageDialog = dialog.message
        confirmDialog = dialog.confirm
        openDialog = dialog.open
        saveDialog = dialog.save
        console.log('[TauriPlugins] Dialog plugin loaded successfully')
      } catch (err) {
        console.warn('[TauriPlugins] Dialog plugin not available:', err)
      }
      
      try {
        const haptics = await import('@tauri-apps/plugin-haptics')
        triggerHapticFn = haptics.trigger
        console.log('[TauriPlugins] Haptics plugin loaded successfully')
      } catch (err) {
        console.warn('[TauriPlugins] Haptics plugin not available:', err)
      }
      
      pluginsInitialized = true
    })()
    
    return initPromise
  }
  
  // Auto-initialize on first use
  if (isTauri.value) {
    initPlugins()
  }

  /**
   * Show a native notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @returns {Promise<void>}
   */
  const showNotification = async (title, body) => {
    if (!isTauri.value) {
      console.log('[TauriPlugins] Notification not available, using browser fallback')
      
      // Fallback to browser Notification API if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body })
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      }
      return
    }
    
    try {
      await initPlugins()
      
      if (!sendNotification || !isPermissionGranted || !requestPermission) {
        console.warn('[TauriPlugins] Notification plugin failed to load')
        return
      }
      
      // Check permission first
      let permission = await isPermissionGranted()
      
      if (!permission) {
        permission = await requestPermission()
      }
      
      if (permission === 'granted' || permission === true) {
        await sendNotification({ title, body })
      } else {
        console.warn('[TauriPlugins] Notification permission denied')
      }
    } catch (error) {
      console.error('[TauriPlugins] Notification error:', error)
    }
  }

  /**
   * Show a native dialog
   * @param {('info'|'warning'|'error')} type - Dialog type
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @returns {Promise<void>}
   */
  const showDialog = async (type = 'info', title, message) => {
    if (!isTauri.value) {
      console.log('[TauriPlugins] Dialog not available, using browser alert')
      alert(`${title}\n\n${message}`)
      return
    }
    
    try {
      await initPlugins()
      
      if (!messageDialog) {
        console.warn('[TauriPlugins] Dialog plugin failed to load')
        alert(`${title}\n\n${message}`)
        return
      }
      
      const kind = type === 'info' || type === 'warning' || type === 'error' ? type : 'info'
      await messageDialog(message, { title, kind })
    } catch (error) {
      console.error('[TauriPlugins] Dialog error:', error)
    }
  }

  /**
   * Show a confirmation dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @returns {Promise<boolean>} - Returns true if user confirmed, false otherwise
   */
  const showConfirmDialog = async (title, message) => {
    if (!isTauri.value) {
      console.log('[TauriPlugins] Confirm dialog not available, using browser confirm')
      return window.confirm(`${title}\n\n${message}`)
    }
    
    try {
      await initPlugins()
      
      if (!confirmDialog) {
        return window.confirm(`${title}\n\n${message}`)
      }
      
      return await confirmDialog(message, { title })
    } catch (error) {
      console.error('[TauriPlugins] Confirm dialog error:', error)
      return false
    }
  }

  /**
   * Show an open file dialog
   * @param {Object} options - Dialog options
   * @param {boolean} options.multiple - Allow multiple file selection
   * @param {Array<string>} options.filters - File type filters
   * @returns {Promise<string|string[]|null>} - Selected file path(s) or null if cancelled
   */
  const showOpenDialog = async (options = {}) => {
    if (!isTauri.value) {
      console.log('[TauriPlugins] File dialog not available in web mode')
      return null
    }
    
    try {
      await initPlugins()
      
      if (!openDialog) {
        return null
      }
      
      return await openDialog({
        multiple: options.multiple || false,
        filters: options.filters || []
      })
    } catch (error) {
      console.error('[TauriPlugins] Open dialog error:', error)
      return null
    }
  }

  /**
   * Show a save file dialog
   * @param {Object} options - Dialog options
   * @param {string} options.defaultPath - Default file path/name
   * @param {Array<string>} options.filters - File type filters
   * @returns {Promise<string|null>} - Selected file path or null if cancelled
   */
  const showSaveDialog = async (options = {}) => {
    if (!isTauri.value) {
      console.log('[TauriPlugins] File dialog not available in web mode')
      return null
    }
    
    try {
      await initPlugins()
      
      if (!saveDialog) {
        return null
      }
      
      return await saveDialog({
        defaultPath: options.defaultPath,
        filters: options.filters || []
      })
    } catch (error) {
      console.error('[TauriPlugins] Save dialog error:', error)
      return null
    }
  }

  /**
   * Trigger haptic feedback
   * @param {string} type - Haptic type ('notification', 'impact', 'selection')
   * @param {string} intensity - Intensity level ('success', 'warning', 'error', 'light', 'medium', 'heavy')
   * @returns {Promise<void>}
   */
  const triggerHaptic = async (type = 'impact', intensity = 'medium') => {
    if (!isTauri.value) {
      console.log('[TauriPlugins] Haptic feedback not available in web mode')
      return
    }
    
    try {
      await initPlugins()
      
      if (!triggerHapticFn) {
        console.warn('[TauriPlugins] Haptic plugin failed to load')
        return
      }
      
      // Map notification types to haptic feedback
      if (type === 'notification') {
        const notificationMap = {
          'success': { type: 'notification', notificationType: 'success' },
          'warning': { type: 'notification', notificationType: 'warning' },
          'error': { type: 'notification', notificationType: 'error' }
        }
        
        const hapticConfig = notificationMap[intensity] || { type: 'notification', notificationType: 'success' }
        await triggerHapticFn(hapticConfig)
      } else {
        // For impact and selection types
        await triggerHapticFn({ type, intensity })
      }
    } catch (error) {
      console.error('[TauriPlugins] Haptic error:', error)
    }
  }

  return {
    // State
    isTauri,
    
    // Notifications
    showNotification,
    
    // Dialogs
    showDialog,
    showConfirmDialog,
    showOpenDialog,
    showSaveDialog,
    
    // Haptics
    triggerHaptic
  }
}