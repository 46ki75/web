#![deny(missing_docs)]
//! Controller that handles requests related to blog images.

/// Route handler for Axum.
/// Fetched the OGP image for a blog page by its page ID.
pub async fn handle_fetch_ogp_image(
    axum::extract::State(blog_service): axum::extract::State<
        std::sync::Arc<crate::service::blog::BlogService>,
    >,
    axum::extract::Path(page_id): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let Ok(blog) = blog_service.get_blog_by_id(&page_id).await else {
        return Err((axum::http::StatusCode::NOT_FOUND, "Not Found".to_string()));
    };

    let image_bytes = blog_service
        .fetch_ogp_image_by_id(&blog.id)
        .await
        .map_err(|e| {
            tracing::error!("An error occurred while fetch ogp image: {}", e);
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        })?;

    let response = match image_bytes {
        Some(bytes) => {
            let mime_type = blog_service.infer_mime_type(&bytes);
            let response = axum::response::Response::builder()
                .status(200)
                .header("content-type", mime_type)
                .body(axum::body::Body::from(bytes))
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                })?;
            Ok(response)
        }
        None => Err((axum::http::StatusCode::NOT_FOUND, "Not Found".to_string())),
    };

    response
}

/// Route handler for Axum.
/// Fetches a block image by its block ID.
pub async fn handle_fetch_block_image(
    axum::extract::State(blog_service): axum::extract::State<
        std::sync::Arc<crate::service::blog::BlogService>,
    >,
    axum::extract::Path(block_id): axum::extract::Path<String>,
) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
    let image_bytes = blog_service
        .fetch_block_image_by_id(&block_id)
        .await
        .map_err(|e| {
            tracing::error!("An error occurred while fetch block image: {}", e);
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        })?;

    let response = match image_bytes {
        Some(bytes) => {
            let mime_type = blog_service.infer_mime_type(&bytes);
            Ok(axum::response::Response::builder()
                .status(200)
                .header("content-type", mime_type)
                .body(axum::body::Body::from(bytes))
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                }))
        }
        None => Err((axum::http::StatusCode::NOT_FOUND, "Not Found".to_string())),
    }?;

    response
}
