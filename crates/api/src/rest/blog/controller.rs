use lambda_http::RequestExt;

pub struct BlogController;

impl BlogController {
    pub async fn blog_block_image(
        event: lambda_http::Request,
    ) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
        let query_params = event.query_string_parameters();

        let r#type = match query_params.first("type") {
            Some(t) => t,
            None => {
                return Ok(lambda_http::Response::builder()
                    .status(400)
                    .header("content-type", "application/json")
                    .body(lambda_http::Body::from(
                        serde_json::json!({
                            "error": "type query parameter is required"
                        })
                        .to_string(),
                    ))?);
            }
        };

        if r#type == "block" {
            let block_id = match query_params.first("block_id") {
                Some(b) => b,
                None => {
                    return Ok(lambda_http::Response::builder()
                        .status(400)
                        .header("content-type", "application/json")
                        .body(lambda_http::Body::from(
                            serde_json::json!({
                                "error": "block_id query parameter is required"
                            })
                            .to_string(),
                        ))?);
                }
            };

            let image_bytes =
                crate::rest::blog::service::BlogImageService::get_image_by_block_id(block_id)
                    .await?;

            let content_type =
                infer::get(&image_bytes).map_or("application/octet-stream", |t| t.mime_type());

            let body = lambda_http::Body::Binary(image_bytes.to_vec());

            let response = lambda_http::Response::builder()
                .status(200)
                .header("content-type", content_type)
                .body(body)?;

            Ok(response)
        } else if r#type == "database" {
            let slug = match query_params.first("slug") {
                Some(b) => b,
                None => {
                    return Ok(lambda_http::Response::builder()
                        .status(400)
                        .header("content-type", "application/json")
                        .body(lambda_http::Body::from(
                            serde_json::json!({
                                "error": "slug query parameter is required"
                            })
                            .to_string(),
                        ))?);
                }
            };

            let slug_number = slug.parse::<u64>()?;

            let image_bytes =
                crate::rest::blog::service::BlogImageService::get_image_by_slug(slug_number)
                    .await?;

            let content_type =
                infer::get(&image_bytes).map_or("application/octet-stream", |t| t.mime_type());

            let body = lambda_http::Body::Binary(image_bytes.to_vec());

            let response = lambda_http::Response::builder()
                .status(200)
                .header("content-type", content_type)
                .body(body)?;

            Ok(response)
        } else {
            return Ok(lambda_http::Response::builder()
                .status(400)
                .header("content-type", "application/json")
                .body(lambda_http::Body::from(
                serde_json::json!({
                    "error": "type query parameter is invalid. Available values: block, database"
                })
                .to_string(),
            ))?);
        }
    }
}
