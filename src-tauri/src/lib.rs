use tauri::{Manager, Emitter};
use std::sync::Mutex;

// State to track if logout needs to happen on startup
struct AppState {
  needs_logout: Mutex<bool>,
}

#[tauri::command]
fn mark_logout_required(state: tauri::State<AppState>) {
  let mut needs_logout = state.needs_logout.lock().unwrap();
  *needs_logout = true;
}

#[tauri::command]
fn clear_logout_flag(state: tauri::State<AppState>) {
  let mut needs_logout = state.needs_logout.lock().unwrap();
  *needs_logout = false;
}

#[tauri::command]
fn check_logout_required(state: tauri::State<AppState>) -> bool {
  let needs_logout = state.needs_logout.lock().unwrap();
  *needs_logout
}

#[tauri::command]
async fn handle_app_close(app: tauri::AppHandle) -> Result<(), String> {
  // Emit event to frontend to trigger logout
  app.emit("app-closing", ()).map_err(|e| e.to_string())?;
  
  // Give frontend time to logout (500ms)
  std::thread::sleep(std::time::Duration::from_millis(500));
  
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  #[allow(unused_mut)]
  let mut builder = tauri::Builder::default()
    .manage(AppState {
      needs_logout: Mutex::new(false),
    })
    .invoke_handler(tauri::generate_handler![
      mark_logout_required,
      clear_logout_flag,
      check_logout_required,
      handle_app_close
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Set up window close handler
      if let Some(window) = app.get_webview_window("main") {
        let app_handle = app.handle().clone();
        
        window.on_window_event(move |event| {
          match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
              // Prevent immediate close
              api.prevent_close();
              
              // Trigger logout process via app handle
              let app_clone = app_handle.clone();
              std::thread::spawn(move || {
                // Emit event to frontend
                let _ = app_clone.emit("app-closing", ());
                
                // Allow close after delay
                std::thread::sleep(std::time::Duration::from_millis(800));
                
                // Exit the app
                app_clone.exit(0);
              });
            }
            _ => {}
          }
        });
      }

      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_notification::init());

  #[cfg(mobile)]
  {
    builder = builder
      .plugin(tauri_plugin_biometric::init())
      .plugin(tauri_plugin_haptics::init())
      .plugin(tauri_plugin_deep_link::init());
  }

  builder
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
