pub async fn handler(_event: lambda_http::Request) -> lambda_http::Response<lambda_http::Body> {
    lambda_http::Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(lambda_http::Body::from(r#"{"message": "Hello, world!"}"#))
        .expect("Failed to render response")
}

pub async fn not_found_handler(
    _event: lambda_http::Request,
) -> lambda_http::Response<lambda_http::Body> {
    lambda_http::Response::builder()
        .status(404)
        .header("content-type", "application/json")
        .body(include_str!("../../endpoints.json").into())
        .expect("Failed to render response")
}
