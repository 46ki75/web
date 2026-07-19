# FineNight web

Personal site built with SolidStart and deployed through Nitro to AWS Lambda.

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
