#[derive(Debug, Clone, serde::Serialize, utoipa::ToSchema)]
pub struct WebConfigResponse {
    pub rum_identity_pool_id: String,
    pub rum_app_monitor_id: String,
}
