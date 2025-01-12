pub async fn graphql_playground_handler(
    _event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    let playground_html = async_graphql::http::GraphiQLSource::build()
        .endpoint("/lambda-url/api/graphql")
        .finish();

    let response = lambda_http::Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(playground_html.into())?;

    Ok(response)
}

pub async fn graphql_execution_handler(
    event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    let schema = super::schema::create_schema(&event);

    let request_body = event.body();

    let gql_request = match serde_json::from_slice::<async_graphql::Request>(request_body) {
        Ok(request) => request,
        Err(err) => {
            return Ok(lambda_http::Response::builder()
                .status(400)
                .header("content-type", "application/json")
                .body(
                    serde_json::json!({"error": format!("Invalid request body: {}", err)})
                        .to_string()
                        .into(),
                )?);
        }
    };

    let gql_response = schema.execute(gql_request).await;

    let response_body = match serde_json::to_string(&gql_response) {
        Ok(body) => body,
        Err(err) => {
            return Ok(lambda_http::Response::builder()
                .status(500)
                .header("content-type", "application/json")
                .body(
                    serde_json::json!({"error": format!("Failed to serialize response: {}", err)})
                        .to_string()
                        .into(),
                )?);
        }
    };

    let response = lambda_http::Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(response_body.into())?;

    Ok(response)
}

pub async fn method_not_allowed_handler(
    _event: lambda_http::Request,
) -> Result<lambda_http::Response<lambda_http::Body>, lambda_http::Error> {
    let response = lambda_http::Response::builder()
        .status(405)
        .header("content-type", "application/json")
        .body(
            serde_json::json!({"error":"Method Not Allowed"})
                .to_string()
                .into(),
        )?;

    Ok(response)
}
