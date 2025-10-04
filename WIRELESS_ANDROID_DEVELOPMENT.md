# Wireless Android Development Guide 📡

Run your app on your Android phone **completely wirelessly** - no USB cable needed after initial setup!

## Requirements

- Android 11 or higher (for easiest setup)
- Your phone and Mac on the **same WiFi network**
- USB cable (only for initial pairing)

## 🚀 Quick Setup (Android 11+)

### Step 1: One-Time Pairing with USB

1. **Enable Developer Options** on your phone:
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable Wireless Debugging:**
   - Settings → Developer Options → Enable "Wireless debugging"

3. **Connect phone via USB (just this once)**

4. **Pair your devices:**
   ```bash
   # Start ADB server
   adb tcpip 5555
   
   # Wait a few seconds, then disconnect USB cable
   ```

5. **Find your phone's IP address:**
   - On phone: Settings → About Phone → Status → IP address
   - Or: Settings → WiFi → Tap your network → See IP address
   - Example: `192.168.1.50`

6. **Connect wirelessly:**
   ```bash
   # Replace with your phone's IP
   adb connect 192.168.1.50:5555
   ```

7. **Verify connection:**
   ```bash
   adb devices
   ```
   
   Should show:
   ```
   List of devices attached
   192.168.1.50:5555       device
   ```

### Step 2: Run Your App Wirelessly

```bash
npm run tauri android dev
```

**That's it! Your app will:**
- ✅ Build and install wirelessly
- ✅ Connect to dev server over WiFi
- ✅ Support hot reload
- ✅ No cable needed!

## 🔄 Alternative: Using QR Code (Android 11+)

Even easier - no IP address needed!

### One-Time Setup:

1. **On your phone:**
   - Settings → Developer Options → Wireless debugging
   - Tap "Pair device with pairing code"
   - A QR code and pairing code appear

2. **On your Mac:**
   ```bash
   # This will show a QR code scanner
   adb pair
   ```

3. **Scan the QR code** from your phone screen with your Mac's camera

4. **Or enter the pairing code manually:**
   ```bash
   # Get IP and port from your phone's pairing screen
   # Example: 192.168.1.50:37891
   adb pair 192.168.1.50:37891
   # Enter the 6-digit code shown on phone
   ```

5. **Connect:**
   ```bash
   # Use the IP:PORT shown under "Device name" on your phone
   # Example: 192.168.1.50:45678
   adb connect 192.168.1.50:45678
   ```

Now you're connected wirelessly forever!

## 🔧 Full Development Workflow (Wireless)

### Daily Workflow:

```bash
# 1. Connect wirelessly (if not already connected)
adb connect 192.168.1.50:5555

# 2. Verify connection
adb devices

# 3. Run your app
npm run tauri android dev

# 4. Code, save, see changes on phone instantly!
```

### View Logs Wirelessly:

```bash
adb logcat | grep -i switchfit
```

### Install APK Wirelessly:

```bash
# Build APK
npm run tauri android build

# Install over WiFi
adb install src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk
```

## 💡 Pro Tips

### Save Your Phone's IP for Easy Reconnection

Create a shell alias in `~/.zshrc`:

```bash
# Add this to your ~/.zshrc
alias adb-phone="adb connect 192.168.1.50:5555"
alias adb-check="adb devices"
```

Then:
```bash
source ~/.zshrc

# Now you can just type:
adb-phone
adb-check
```

### Auto-Reconnect Script

Create a file `connect-phone.sh`:

```bash
#!/bin/bash

PHONE_IP="192.168.1.50"  # Replace with your phone's IP
PHONE_PORT="5555"

echo "🔌 Connecting to phone at $PHONE_IP:$PHONE_PORT..."

adb connect $PHONE_IP:$PHONE_PORT

sleep 2

if adb devices | grep -q "$PHONE_IP:$PHONE_PORT"; then
    echo "✅ Connected successfully!"
    echo ""
    echo "📱 Connected devices:"
    adb devices
else
    echo "❌ Connection failed. Make sure:"
    echo "   1. Phone and Mac are on same WiFi"
    echo "   2. Wireless debugging is enabled on phone"
    echo "   3. IP address is correct: $PHONE_IP"
fi
```

Make it executable:
```bash
chmod +x connect-phone.sh
./connect-phone.sh
```

## 🔄 Reconnecting After Phone Sleep/Restart

Your phone may disconnect after:
- Going to sleep
- Restarting
- Changing WiFi networks

**Quick reconnection:**

```bash
# Method 1: Reconnect with saved IP
adb connect 192.168.1.50:5555

# Method 2: If that fails, reconnect via USB once
# Connect USB cable
adb tcpip 5555
# Wait 5 seconds, disconnect USB
adb connect 192.168.1.50:5555
```

## 🌐 Network Considerations

### Ensure Same WiFi Network

**On Mac - Check WiFi:**
```bash
# See your current network
networksetup -getairportnetwork en0
```

**On Phone:**
- Settings → WiFi → Check connected network name

**Must match!**

### Firewall Settings

If connection fails, check your Mac's firewall:

1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Ensure "Block all incoming connections" is **OFF**
4. Or add ADB to allowed apps

### Corporate/School WiFi Issues

Some networks block device-to-device communication:

**Solutions:**
1. **Use a personal hotspot:**
   - Create hotspot on your phone
   - Connect Mac to phone's hotspot
   - Use `192.168.43.1:5555` (typical hotspot IP)

2. **Use USB tethering:**
   - Connect phone via USB
   - Enable USB tethering on phone
   - Use `192.168.42.129:5555` (typical tethering IP)

## 📊 Connection Status Checking

### Check if Wireless Debugging is Active:

```bash
adb devices -l
```

Output example:
```
192.168.1.50:5555      device product:model device:name
```

### Check Connection Quality:

```bash
# Ping your phone
ping 192.168.1.50

# Should show low latency (< 50ms ideal)
```

### Troubleshoot Connection:

```bash
# Kill ADB server
adb kill-server

# Start fresh
adb start-server

# Reconnect
adb connect 192.168.1.50:5555
```

## 🆚 Wireless vs USB: Comparison

| Feature | Wireless | USB |
|---------|----------|-----|
| **Setup** | One-time pairing | Plug and play |
| **Speed** | Slower (~5-10MB/s) | Faster (~20-40MB/s) |
| **Stability** | Can disconnect | Very stable |
| **Convenience** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Mobility** | Phone can move freely | Tethered to Mac |
| **Power** | Drains phone battery | Charges phone |
| **Best for** | Development/testing | Large file transfers |

**Recommendation:** Use wireless for day-to-day development, USB for:
- Initial setup
- Large APK installations
- When WiFi is unstable
- When debugging complex issues

## 🎯 Complete Wireless Setup Example

```bash
# === ONE-TIME SETUP ===

# 1. Enable wireless debugging on phone (Settings → Developer Options)

# 2. Connect via USB (just once)
adb tcpip 5555

# 3. Find phone's IP (on phone: Settings → About → Status → IP)
# Example: 192.168.1.50

# 4. Disconnect USB cable

# 5. Connect wirelessly
adb connect 192.168.1.50:5555

# 6. Verify
adb devices


# === DAILY USAGE ===

# Connect (if needed)
adb connect 192.168.1.50:5555

# Run your app
npm run tauri android dev

# See logs in another terminal
adb logcat | grep -i switchfit

# Done! Code and see changes on your phone wirelessly!
```

## 🐛 Troubleshooting Wireless Connection

### Problem: "unable to connect to 192.168.1.50:5555"

**Solutions:**
```bash
# 1. Check phone's IP hasn't changed
# Phone: Settings → WiFi → Tap network → Check IP

# 2. Restart wireless debugging on phone
# Turn OFF then ON: Settings → Developer Options → Wireless debugging

# 3. Reconnect via USB once
# Connect USB
adb tcpip 5555
# Wait, disconnect USB
adb connect YOUR_PHONE_IP:5555
```

### Problem: "device offline"

**Solutions:**
```bash
# Disconnect and reconnect
adb disconnect
adb connect 192.168.1.50:5555

# Or restart ADB
adb kill-server
adb start-server
adb connect 192.168.1.50:5555
```

### Problem: Connection keeps dropping

**Causes:**
- Phone going to sleep
- WiFi power saving mode
- Weak WiFi signal

**Solutions:**
1. **Keep phone awake during development:**
   - Settings → Developer Options → Stay awake (while charging)

2. **Disable WiFi power saving:**
   - Settings → WiFi → Advanced → Keep WiFi on during sleep: Always

3. **Move closer to WiFi router**

### Problem: Can't find phone's IP

**Solutions:**
```bash
# Method 1: Check on phone
# Settings → About Phone → Status → IP address

# Method 2: Use network scanner
# Download "Fing" app on phone to see its IP

# Method 3: Check router admin panel
# Usually http://192.168.1.1 or http://192.168.0.1
```

## 🎓 Advanced: Multiple Devices

Connect multiple phones wirelessly:

```bash
# Phone 1
adb connect 192.168.1.50:5555

# Phone 2  
adb connect 192.168.1.51:5555

# Phone 3
adb connect 192.168.1.52:5555

# List all
adb devices

# Deploy to specific phone
adb -s 192.168.1.50:5555 install app.apk
```

## ✅ Wireless Setup Checklist

- [ ] Android 11+ installed on phone
- [ ] Developer options enabled
- [ ] Wireless debugging enabled
- [ ] Phone and Mac on same WiFi
- [ ] Paired once via USB with `adb tcpip 5555`
- [ ] Phone's IP address known
- [ ] Successfully connected with `adb connect IP:5555`
- [ ] Verified with `adb devices`
- [ ] Successfully ran `npm run tauri android dev`

---

**Once set up, wireless development is incredibly convenient! You can move around freely with your phone while developing.** 📱✨

For any issues, refer back to [`RUN_ON_ANDROID_PHONE.md`](RUN_ON_ANDROID_PHONE.md) for USB fallback instructions.