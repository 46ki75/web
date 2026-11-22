# FineNight web

Personal site built with SolidJS 2, Solid Router, and `@solidjs/vite-plugin` start mode. Nitro deploys the server-rendered frontend to AWS Lambda.

## Development

```sh
pnpm install
pnpm dev
```

## Verification

```sh
pnpm build
pnpm build.types
pnpm lint
pnpm stylelint
pnpm test
```

The production build writes static assets to `.output/public` and the AWS
Lambda handler to `.output/server/index.mjs`.
