// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn start_recording() -> Result<String, String> {
    // Implementation would go here
    // Should return a unique session ID for the recording session
    todo!()
}

#[tauri::command]
fn pause_recording(session_id: String) -> Result<(), String> {
    // Implementation would go here
    // Should pause the recording for the given session
    todo!()
}

#[tauri::command]
fn resume_recording(session_id: String) -> Result<(), String> {
    // Implementation would go here
    // Should resume the recording for the given session
    todo!()
}

#[tauri::command]
fn stop_recording(session_id: String) -> Result<(), String> {
    // Implementation would go here
    // Should stop and finalize the recording for the given session
    todo!()
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            start_recording,
            pause_recording, 
            resume_recording,
            stop_recording
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
