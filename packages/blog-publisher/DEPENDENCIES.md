# Publisher dependency review

`pnpm audit --prod` reports advisories across the workspace. For the publisher's
`n2a2ui@0.8.1` dependency tree:

- `ajv`, `fast-uri`, `js-yaml`, and `postcss-selector-parser` come through
  `@elmethis/core`'s Stylelint dependencies. The converter imports a catalog
  constant; the snapshot command does not run that tooling.
- Zod v3 is loaded, but generating complete Notion snapshots for dev, staging,
  and production with `NODE_V8_COVERAGE` showed zero calls to its validation
  entry points and internal parsers. No affected Stylelint dependency above
  was loaded. [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
  concerns array validation; this is reachability evidence, not a patched Zod
  version or a guarantee about other `n2a2ui` entry points.

Recheck before upgrading the converter or changing how the publisher uses it.
To repeat, set `NODE_V8_COVERAGE` to a private temporary directory and run the
normal `snapshot` command. Inspect the `result` script URLs and top-level
function range call counts in the resulting coverage JSON. Do not commit or
upload that directory. The publisher is a CLI, not a public service; the preview
only serves existing files on loopback and is not deployed.
