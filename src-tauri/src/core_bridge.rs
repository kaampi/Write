use serde::Serialize;
use serde_json::Value;

const CORE_URL: &str = "http://127.0.0.1:43127";

#[derive(Serialize)]
pub struct CoreConnection {
    pub paired: bool,
    pub reachable: bool,
}

fn valid_project_id(id: &str) -> bool {
    !id.is_empty() && id.len() <= 256 && id.bytes().all(|byte| byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_')
}

#[cfg(target_os = "windows")]
fn credential() -> Result<keyring::Entry, String> {
    keyring::Entry::new("se.ocedo.storybookai.core", "storybook")
        .map_err(|_| "Windows Credential Manager is unavailable".to_string())
}

#[cfg(target_os = "windows")]
fn saved_token() -> Result<String, String> {
    credential()?.get_password().map_err(|_| "Storybook is not paired with Core".to_string())
}

#[cfg(not(target_os = "windows"))]
fn saved_token() -> Result<String, String> {
    Err("Core desktop pairing is currently available on Windows only".to_string())
}

fn check_identity(token: &str) -> Result<(), String> {
    let identity: Value = ureq::get(&format!("{CORE_URL}/v1/identity"))
        .header("Authorization", format!("Bearer {token}"))
        .call()
        .map_err(|_| "Cannot authenticate with local Core".to_string())?
        .body_mut()
        .read_json()
        .map_err(|_| "Invalid Core identity response".to_string())?;
    if identity.get("app").and_then(Value::as_str) != Some("storybook") {
        return Err("This Core credential does not belong to Storybook".to_string());
    }
    Ok(())
}

/// Pair once using the 64-character secret from Core's administrator-only provisioning.
/// The secret is held by Windows Credential Manager, never returned to the webview.
#[tauri::command]
pub async fn core_pair(token: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        if token.len() != 64 || !token.bytes().all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase()) {
            return Err("Invalid Core credential".to_string());
        }
        check_identity(&token)?;
        #[cfg(target_os = "windows")]
        { credential()?.set_password(&token).map_err(|_| "Could not save the Core credential".to_string()) }
        #[cfg(not(target_os = "windows"))]
        { Err("Core desktop pairing is currently available on Windows only".to_string()) }
    }).await.map_err(|_| "Core pairing failed".to_string())?
}

#[tauri::command]
pub async fn core_connection() -> CoreConnection {
    tauri::async_runtime::spawn_blocking(|| match saved_token() {
        Ok(token) => CoreConnection { paired: true, reachable: check_identity(&token).is_ok() },
        Err(_) => CoreConnection { paired: false, reachable: false },
    }).await.unwrap_or(CoreConnection { paired: false, reachable: false })
}

#[tauri::command]
pub async fn core_publish_shared(publication: Value) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let id = publication.get("projectId").and_then(Value::as_str)
            .ok_or_else(|| "Missing manuscript ID".to_string())?;
        if !valid_project_id(id) { return Err("Invalid manuscript ID".to_string()); }
        let token = saved_token()?;
        ureq::put(&format!("{CORE_URL}/v1/shared-manuscripts/{id}"))
            .header("Authorization", format!("Bearer {token}"))
            .send_json(&publication)
            .map_err(|_| "Core did not accept the manuscript publication".to_string())?;
        Ok(())
    }).await.map_err(|_| "Core publication failed".to_string())?
}

#[tauri::command]
pub async fn core_revoke_shared(project_id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        if !valid_project_id(&project_id) { return Err("Invalid manuscript ID".to_string()); }
        let token = saved_token()?;
        ureq::delete(&format!("{CORE_URL}/v1/shared-manuscripts/{project_id}"))
            .header("Authorization", format!("Bearer {token}"))
            .call()
            .map_err(|_| "Core did not confirm revoked sharing".to_string())?;
        Ok(())
    }).await.map_err(|_| "Core revocation failed".to_string())?
}

#[cfg(test)]
mod tests {
    use super::valid_project_id;

    #[test]
    fn paths_accept_only_local_book_ids() {
        assert!(valid_project_id("a1b2-uuid"));
        assert!(!valid_project_id("../other"));
        assert!(!valid_project_id("book?reader=comic"));
        assert!(!valid_project_id(""));
    }
}
