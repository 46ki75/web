// Stub for `pkce-challenge` — pulled in transitively by `@modelcontextprotocol/sdk`
// (via @elmethis/qwik's MCP client) which this app never executes. The real
// package's `exports` field lacks a `default` condition, which trips Vite's
// resolver during the client build even though the call site is dead code.
export default async function pkceChallenge(): Promise<{
  code_verifier: string;
  code_challenge: string;
}> {
  throw new Error("pkce-challenge is stubbed in this build");
}

export async function verifyChallenge(): Promise<boolean> {
  throw new Error("pkce-challenge is stubbed in this build");
}
