# HTTP API

This crate is an API server that is deployed using AWS Lambda and API Gateway. It provides both REST API and GraphQL API endpoints to handle requests from various clients.

## Directory Structure

| Directory / File  | Contents                                          |
| ----------------- | ------------------------------------------------- |
| `scripts/`        | Utility scripts for deployment and other purposes |
| `src/`            | Source code                                       |
| `.env`            | Environment variables file (not tracked in git)   |
| `.endpoints.json` | List of endpoints                                 |
| `Justfile`        | Command runner configuration file                 |

## Starting the Development Server

### Requirements

To start the development server, ensure you have the following installed and configured:

- Cargo
- [Cargo Lambda](https://www.cargo-lambda.info/)
- [Just - command runner](https://github.com/casey/just)
- AWS CLI
- AWS SSO Configuration

### Environment Variables

Please set the following environment variables in the `.env` file:

| Variable                  | Variants                      |
| ------------------------- | ----------------------------- |
| `NOTION_API_KEY`          | String                        |
| `NOTION_BLOG_DATABASE_ID` | String                        |
| `ENVIRONMENT`             | `local`, `dev`, `stg`, `prod` |

### Start Development Server

To start the development server locally, execute the following command. This will use the `just` command runner to set up and start the server:

```sh
just dev
```

Then, you can acccess to `http://localhost:10000/lambda-url/api/`.

- REST: `http://localhost:10000/lambda-url/api/api/v1`
- GraphQL: `http://localhost:10000/lambda-url/api/api/graphql`

## Usage

<!-- TODO: -->

## Testing

<!-- TODO: -->

## Function Deployment (AWS Lambda)

First, fetch the AWS credentials:

```sh
aws sso login
```

Next, you can deploy the function by executing the following command:

```sh
ENVIRONMENT=dev just deploy
```
