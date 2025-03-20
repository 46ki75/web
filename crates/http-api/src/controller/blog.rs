pub struct BlogController {
    pub blog_service: crate::service::blog::BlogService,
}

impl BlogController {
    pub async fn fetch_ogp_image_by_id(
        &self,
        request: lambda_http::Request,
    ) -> Result<lambda_http::Response<lambda_http::Body>, crate::error::Error> {
        let Some(page_id) = request.uri().path().split('/').last() else {
            return lambda_http::Response::builder()
                .status(404)
                .header("content-type", "application/json")
                .body(lambda_http::Body::Text("Not Found".to_string()))
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    crate::error::Error::BuildResponse(e.to_string())
                });
        };

        let Ok(blog) = self.blog_service.get_blog_by_id(page_id).await else {
            return lambda_http::Response::builder()
                .status(404)
                .header("content-type", "application/json")
                .body(lambda_http::Body::Text("Not Found".to_string()))
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    crate::error::Error::BuildResponse(e.to_string())
                });
        };

        let image_bytes = self.blog_service.fetch_ogp_image_by_id(&blog.id).await?;

        match image_bytes {
            Some(bytes) => lambda_http::Response::builder()
                .status(200)
                .header("content-type", "image/png")
                .body(lambda_http::Body::Binary(bytes.into()))
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    crate::error::Error::BuildResponse(e.to_string())
                }),
            None => lambda_http::Response::builder()
                .status(404)
                .header("content-type", "application/json")
                .body(lambda_http::Body::Text("Not Found".to_string()))
                .map_err(|e| {
                    tracing::error!("Failed to build response: {}", e);
                    crate::error::Error::BuildResponse(e.to_string())
                }),
        }
    }
}
