# HTTP API

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

## Deployment

```sh
ENVIRONMENT=dev just deploy
```
