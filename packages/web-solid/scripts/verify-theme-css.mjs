import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve(process.argv[2] ?? ".output/public");

const findCssFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? findCssFiles(entryPath)
        : entry.name.endsWith(".css")
          ? [entryPath]
          : [];
    }),
  );
  return files.flat();
};

const cssFiles = await findCssFiles(outputDirectory);
if (cssFiles.length === 0) {
  throw new Error(
    `${path.relative(process.cwd(), outputDirectory)} contains no CSS artifacts`,
  );
}

const stylesheets = await Promise.all(
  cssFiles.map(async (file) => ({
    file,
    content: (await readFile(file, "utf8")).replaceAll(/\s/g, ""),
  })),
);
const surfaceProperty = "--elmethis-color-surface-base";
const expectedSurfaceValue =
  "light-dark(var(--elmethis-primitive-color-gold-200),var(--elmethis-primitive-color-slate-700))";
const tokenStylesheet = stylesheets.find(({ content }) =>
  content.includes(`${surfaceProperty}:`),
);

if (!tokenStylesheet) {
  throw new Error("Production CSS does not contain Elmethis theme tokens");
}

const surfaceDeclarations = [
  ...tokenStylesheet.content.matchAll(
    /--elmethis-color-surface-base:([^;}]+)/g,
  ),
].map((match) => match[1]);
const relativeFile = path.relative(process.cwd(), tokenStylesheet.file);

if (surfaceDeclarations.length < 2) {
  throw new Error(
    `${relativeFile} does not load raw @elmethis/core tokens after the framework stylesheet`,
  );
}

if (surfaceDeclarations.at(-1) !== expectedSurfaceValue) {
  throw new Error(
    `${relativeFile} does not preserve the native ${surfaceProperty} declaration as the final cascade value`,
  );
}

if (
  !tokenStylesheet.content.includes(
    "--elmethis-primitive-color-slate-700:#393e46",
  ) ||
  !/:root\[data-theme=["']?dark["']?\]\{[^}]*color-scheme:dark/.test(
    tokenStylesheet.content,
  )
) {
  throw new Error(
    `${relativeFile} does not resolve the dark ${surfaceProperty} token to #393e46`,
  );
}

console.log(
  "Built CSS preserves Elmethis light-dark() tokens and resolves the dark surface to #393e46.",
);
