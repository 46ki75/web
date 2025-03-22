pub struct BlogController {
    pub blog_service: std::sync::Arc<crate::service::blog::BlogService>,
}

impl BlogController {
    pub async fn handle_fetch_ogp_image(
        &self,
        page_id: String,
    ) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
        let Ok(blog) = self.blog_service.get_blog_by_id(&page_id).await else {
            return Err((axum::http::StatusCode::NOT_FOUND, "Not Found".to_string()));
        };

        let image_bytes = self
            .blog_service
            .fetch_ogp_image_by_id(&blog.id)
            .await
            .map_err(|e| {
                tracing::error!("An error occurred while fetch ogp image: {}", e);
                (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
            })?;

        let response = match image_bytes {
            Some(bytes) => {
                let response = axum::response::Response::builder()
                    .status(200)
                    .header("content-type", "image/webp")
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

    pub async fn handle_fetch_block_image(
        &self,
        block_id: String,
    ) -> Result<axum::response::Response<axum::body::Body>, (axum::http::StatusCode, String)> {
        let image_bytes = self
            .blog_service
            .fetch_block_image_by_id(&block_id)
            .await
            .map_err(|e| {
                tracing::error!("An error occurred while fetch block image: {}", e);
                (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
            })?;

        let response = match image_bytes {
            Some(bytes) => Ok(axum::response::Response::builder()
                .status(200)
                .header("content-type", "image/webp")
                .body(axum::body::Body::from(bytes))
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                })),
            None => Err((axum::http::StatusCode::NOT_FOUND, "Not Found".to_string())),
        }?;

        response
    }
}
