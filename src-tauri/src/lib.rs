use std::sync::{Arc, Condvar, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, WindowEvent};
use tauri_plugin_notification::NotificationExt;

/// Events older than this when they come due (e.g. the PC was asleep) are dropped
/// instead of firing a stale adhan.
const LATE_TOLERANCE_MS: i64 = 120_000;
/// Upper bound on a single wait, so a wall-clock jump (sleep, timezone change)
/// is noticed within this window.
const MAX_WAIT_MS: i64 = 15_000;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScheduledEvent {
    /// Unix epoch milliseconds.
    pub at: i64,
    /// "prayer" or "reminder".
    pub kind: String,
    pub prayer: String,
    pub title: String,
    pub body: String,
}

#[derive(Default)]
struct Scheduler {
    events: Mutex<Vec<ScheduledEvent>>,
    wake: Condvar,
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// The webview computes prayer times; Rust owns the timing so notifications
/// fire on time even while the windows are hidden and their timers are throttled.
#[tauri::command]
fn set_schedule(state: tauri::State<'_, Arc<Scheduler>>, events: Vec<ScheduledEvent>) {
    let mut guard = state.events.lock().unwrap_or_else(|e| e.into_inner());
    *guard = events;
    state.wake.notify_all();
}

fn fire(app: &AppHandle, event: &ScheduledEvent) {
    let _ = app
        .notification()
        .builder()
        .title(&event.title)
        .body(&event.body)
        .show();
    // Only the main window plays audio, so the sound never doubles up.
    let _ = app.emit_to("main", "prayer-due", event.clone());
}

fn spawn_scheduler(app: AppHandle, scheduler: Arc<Scheduler>) {
    std::thread::spawn(move || loop {
        let due = {
            let mut guard = scheduler.events.lock().unwrap_or_else(|e| e.into_inner());
            let now = now_ms();
            let (due, pending): (Vec<_>, Vec<_>) = guard.drain(..).partition(|e| e.at <= now);
            *guard = pending;

            if due.is_empty() {
                let wait = guard
                    .iter()
                    .map(|e| e.at - now)
                    .min()
                    .unwrap_or(MAX_WAIT_MS)
                    .clamp(0, MAX_WAIT_MS);
                let _ = scheduler
                    .wake
                    .wait_timeout(guard, Duration::from_millis(wait as u64));
                continue;
            }
            due
        };

        let now = now_ms();
        for event in due.iter().filter(|e| now - e.at <= LATE_TOLERANCE_MS) {
            fire(&app, event);
        }
    });
}

fn show_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn toggle_widget(app: &AppHandle) {
    if let Some(widget) = app.get_webview_window("widget") {
        let visible = widget.is_visible().unwrap_or(false);
        let _ = if visible {
            widget.hide()
        } else {
            widget.show()
        };
        let _ = app.emit("widget-visibility", !visible);
    }
}

fn build_tray(app: &tauri::App) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "Open Sajda", true, None::<&str>)?;
    let widget = MenuItem::with_id(app, "toggle_widget", "Toggle Widget", true, None::<&str>)?;
    let stop = MenuItem::with_id(app, "stop_sound", "Stop Sound", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Sajda", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &widget, &stop, &separator, &quit])?;

    let mut tray = TrayIconBuilder::with_id("sajda-tray")
        .tooltip("Sajda")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => show_main(app),
            "toggle_widget" => toggle_widget(app),
            "stop_sound" => {
                let _ = app.emit_to("main", "stop-sound", ());
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone());
    }
    tray.build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let scheduler = Arc::new(Scheduler::default());

    tauri::Builder::default()
        // Registered first so a second launch focuses the running app instead.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main(app);
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .plugin(tauri_plugin_notification::init())
        .manage(scheduler.clone())
        .invoke_handler(tauri::generate_handler![set_schedule])
        .setup(move |app| {
            build_tray(app)?;
            spawn_scheduler(app.handle().clone(), scheduler.clone());

            // Launched at login: stay in the tray (the widget shows itself if enabled).
            let autostarted = std::env::args().any(|arg| arg == "--autostart");
            if !autostarted {
                show_main(app.handle());
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            // Closing hides to the tray; only "Quit Sajda" ends the process.
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
                if window.label() == "widget" {
                    let _ = window.app_handle().emit("widget-visibility", false);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Sajda");
}
