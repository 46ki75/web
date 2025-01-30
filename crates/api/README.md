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

- `NOTION_API_KEY`
- `NOTION_BLOG_DATABASE_ID`
- `ENVIRONMENT=local`
