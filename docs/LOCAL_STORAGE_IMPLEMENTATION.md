# Local Storage Implementation for Tauri Mobile

## Overview

This document describes the implementation of local file storage for generated photos on Tauri mobile apps (Android/iOS). Mobile users can choose between local device storage (default) or cloud storage via Supabase using a toggle in Settings.

## Implementation Details

### 1. Tauri File System Plugin

**Package Installed**: `@tauri-apps/plugin-fs`

**Rust Dependencies**: Already configured in `src-tauri/Cargo.toml`:
- `tauri-plugin-fs = "2.0.0-rc.18"`

**Plugin Initialization**: Added in `src-tauri/src/lib.rs`:
```rust
.plugin(tauri_plugin_fs::init())
```

### 2. Permissions Configuration

#### Android Permissions (`src-tauri/gen/android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### Tauri Capabilities (`src-tauri/capabilities/mobile.json`)
Added file system permissions:
- `fs:allow-read`
- `fs:allow-write`
- `fs:allow-read-file`
- `fs:allow-write-file`
- `fs:allow-write-text-file`
- `fs:allow-exists`
- `fs:allow-create`
- `fs:allow-remove`
- `fs:allow-mkdir`
- `fs:allow-read-dir`
- `fs:scope-appdata` (for app-specific storage)
- `fs:scope-picture` (for downloads to user's Pictures folder)

### 3. Local Storage Service

**File**: [`src/services/localStorageService.js`](src/services/localStorageService.js:1)

**Key Features**:
- Saves images to app's private data directory (`BaseDirectory.AppData`)
- Stores both original and generated images as PNG files
- Maintains metadata in JSON format (`gallery-metadata.json`)
- Supports pagination, filtering, and statistics
- Can export images to user's Pictures directory

**Storage Structure**:
```
AppData/
├── generated-images/
│   ├── img_123_abc_generated.png
│   ├── img_123_abc_original.png
│   ├── img_456_def_generated.png
│   └── img_456_def_original.png
└── gallery-metadata.json
```

**Metadata Format**:
```json
[
  {
    "id": "img_1234567890_abc123",
    "original_image_filename": "img_1234567890_abc123_original.png",
    "generated_image_filename": "img_1234567890_abc123_generated.png",
    "prompt": "AI outfit generation",
    "style_description": "Clothing style transfer",
    "file_size": 1234567,
    "created_at": "2025-01-15T12:34:56.789Z",
    "generation_status": "completed"
  }
]
```

### 4. Gallery Service Updates

**File**: [`src/services/galleryService.js`](src/services/galleryService.js:1)

**Platform Detection**:
```javascript
async function isTauriMobile() {
  if (window.__TAURI__) {
    const { platform } = await import('@tauri-apps/plugin-os');
    const platformType = await platform();
    return platformType === 'android' || platformType === 'ios';
  }
  return false;
}

async function shouldUseLocalStorage() {
  const isMobile = await isTauriMobile();
  if (!isMobile) return false;
  
  // Check user preference (defaults to true for mobile)
  const settings = localStorage.getItem('app_settings');
  if (settings) {
    const parsed = JSON.parse(settings);
    return parsed.useLocalStorage !== false;
  }
  return true; // Default to local storage on mobile
}
```

**Automatic Storage Selection**:
All GalleryService methods now check platform and user preference:
- **Tauri Mobile with Local Storage enabled** (default): Uses `LocalStorageService`
- **Tauri Mobile with Cloud Storage enabled**: Uses Supabase
- **Web/Desktop**: Always uses Supabase

**Updated Methods**:
- `saveImage()` - Saves based on platform and user preference
- `getGalleryImages()` - Fetches based on platform and user preference
- `getImageById()` - Retrieves based on platform and user preference
- `deleteImage()` - Deletes based on platform and user preference
- `getGalleryStats()` - Calculates stats based on platform and user preference

### 5. Image Generation Flow

**File**: [`src/views/HomeView.vue`](src/views/HomeView.vue:620)

No changes needed! The existing code at line 620-639 already calls:
```javascript
const galleryResult = await GalleryService.saveImage(imageData);
```

This automatically uses the correct storage backend based on the platform.

## User Settings Toggle

### Settings Page (Mobile Only)

Mobile users can choose their preferred storage method in **Settings > Privacy & data handling**:

**"Use local device storage"** (enabled by default)
- ✅ **Offline access** - Images available without internet
- ✅ **Privacy** - Photos never leave the device
- ✅ **Speed** - Faster than cloud storage
- ❌ **No sync** - Images don't sync across devices

**Cloud Storage** (Supabase - disabled by default)
- ✅ **Cross-device sync** - Access from web/desktop
- ✅ **Automatic backup** - Images stored in cloud
- ❌ **Requires internet** - Must be online to save/view
- ❌ **Privacy** - Images stored on external servers

### Changing Storage Preference

**Important Notes:**
1. Changing storage preference does **not** migrate existing images
2. Previously saved images remain in their original storage location
3. New images will be saved to the newly selected storage
4. To access all images, you may need to switch back to the original storage method

## Benefits

### Local Storage Benefits:
1. **Offline Access**: Images are always available, even without internet
2. **Privacy**: Photos never leave the device
3. **No Storage Costs**: No Supabase storage usage
4. **Faster Access**: Local file system is faster than network requests
5. **Data Control**: Users own their data completely

### Cloud Storage Benefits:
1. **Cross-Device Access**: View images from web or desktop
2. **Automatic Backup**: Images safely stored in cloud
3. **Sharing**: Easier to share images if needed
4. **No Local Space**: Doesn't use device storage

### For Development:
1. **Reduced Server Load**: Mobile apps don't use Supabase storage
2. **Lower Costs**: No storage or bandwidth costs for mobile images
3. **Better Performance**: No network latency for gallery operations
4. **Offline Capability**: App works fully offline after initial auth

## API Compatibility

The [`LocalStorageService`](src/services/localStorageService.js:1) maintains the same API as [`GalleryService`](src/services/galleryService.js:1):

```javascript
// All methods work the same way
await GalleryService.saveImage(imageData);
await GalleryService.getGalleryImages({ limit: 20, offset: 0 });
await GalleryService.getImageById(imageId);
await GalleryService.deleteImage(imageId);
await GalleryService.getGalleryStats();
```

## Storage Locations

### Android:
- **App Data**: `/data/data/com.switchfit.studio/files/`
- **Pictures**: `/storage/emulated/0/Pictures/`

### iOS:
- **App Data**: `~/Library/Application Support/com.switchfit.studio/`
- **Pictures**: `~/Pictures/`

## Testing Instructions

### 1. Build the Mobile App
```bash
npm run tauri:android
# or
npm run tauri:ios
```

### 2. Test Storage Toggle
1. Open Settings on mobile device
2. Find "Use local device storage" toggle
3. Toggle should be checked by default
4. Uncheck to switch to cloud storage
5. Check to switch back to local storage
6. Save settings

### 3. Test Local Storage
1. Ensure "Use local device storage" is enabled
2. Generate an outfit blend
3. Verify image is saved (check console logs for "Using local storage")
4. View in Gallery
5. Enable airplane mode
6. Verify images still visible offline

### 4. Test Cloud Storage
1. Disable "Use local device storage" toggle
2. Save settings
3. Generate an outfit blend
4. Verify image is saved (check console logs for "Using Supabase storage")
5. View in Gallery
6. Images should sync to Supabase

### 5. Test Storage Switching
1. Generate 2 images with local storage enabled
2. Switch to cloud storage
3. Generate 2 more images
4. Switch back to local storage
5. Verify you only see the 2 local images
6. Switch to cloud storage
7. Verify you only see the 2 cloud images

### 6. Test Image Deletion
1. Select an image in the gallery
2. Delete it
3. Verify it's removed from the list
4. Verify deletion from correct storage backend

### 7. Check Storage Stats
1. Generate multiple images
2. Check gallery statistics
3. Verify file counts and sizes are accurate for current storage method

## Migration Notes

### For Existing Users:
- **Web users**: Continue using Supabase (no changes, no toggle available)
- **Desktop Tauri users**: Continue using Supabase (no changes, no toggle available)
- **Mobile users**: Default to local storage, can opt into cloud storage
- **Existing images**: Remain in their original storage location (no automatic migration)

### Future Enhancements:
1. **Migration Tool**: Migrate images between local and cloud storage
2. **Sync Option**: Two-way sync between local and cloud
3. **Export/Import**: Bulk export/import of gallery images
4. **Hybrid Mode**: Store thumbnails locally, full images in cloud
5. **Smart Caching**: Cache cloud images for offline viewing

## Security Considerations

1. **File Permissions**: App has exclusive access to its data directory
2. **No Cloud Exposure**: Images never transmitted to external servers
3. **User Privacy**: Full control over data storage and deletion
4. **Secure Storage**: Uses platform-native secure storage mechanisms

## Troubleshooting

### Images Not Saving:
- Check Android permissions are granted
- Verify Tauri file system plugin is initialized
- Check console logs for errors
- Ensure sufficient storage space

### Images Not Loading:
- Verify metadata file exists (`gallery-metadata.json`)
- Check file paths are correct
- Ensure image files weren't manually deleted
- Check platform detection is working

### Performance Issues:
- Large galleries may take time to load all thumbnails
- Consider implementing lazy loading for very large galleries
- Monitor storage space usage

## FAQ

**Q: What happens to my existing images when I change storage preference?**
A: Existing images stay in their original location. New images will be saved to the new storage. You can switch back to see old images.

**Q: Can I access local images from my computer?**
A: No, local images are stored in the app's private directory on your mobile device. Use cloud storage if you need cross-device access.

**Q: Which storage option is more private?**
A: Local storage is more private - images never leave your device. Cloud storage uploads images to Supabase servers.

**Q: Do local images take up phone storage?**
A: Yes, but images are optimized and stored efficiently. You can check storage usage in your device settings.

**Q: What happens if I uninstall the app?**
A: Local images will be deleted with the app. Cloud images remain in Supabase and are accessible if you reinstall.

**Q: Can I migrate my local images to the cloud?**
A: Not currently. This is a planned future enhancement. For now, switching storage only affects new images.

## Code References

- **Local Storage Service**: [`src/services/localStorageService.js`](src/services/localStorageService.js:1)
- **Gallery Service**: [`src/services/galleryService.js`](src/services/galleryService.js:1)
- **Settings View**: [`src/views/SettingsView.vue`](src/views/SettingsView.vue:178)
- **Platform Detection**: [`src/composables/usePlatform.js`](src/composables/usePlatform.js:1)
- **Mobile Capabilities**: [`src-tauri/capabilities/mobile.json`](src-tauri/capabilities/mobile.json:1)
- **Android Manifest**: [`src-tauri/gen/android/app/src/main/AndroidManifest.xml`](src-tauri/gen/android/app/src/main/AndroidManifest.xml:1)