import * as Comlink from "comlink";

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

export const imageConverterFunctionMap = Comlink.wrap<{
  init(): Promise<void>;
  png({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
  jpeg({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
  bmp({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
  webp({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
}>(worker);
