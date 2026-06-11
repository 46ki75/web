import { component$, useSignal, useVisibleTask$ } from "@qwik.dev/core";

import styles from "./layer-decoration.module.css";

export type LayerDecorationProps = object;

export const LayerDecoration = component$<LayerDecorationProps>(() => {
  const canvasRef = useSignal<HTMLCanvasElement>();

  // WebGL is browser-only: spin it up once the decoration scrolls into view,
  // and tear it down when the component unmounts. `three` is imported lazily
  // here so it never lands in the SSR or initial client bundle.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    import("./atom-scene").then(({ createAtomScene }) => {
      if (cancelled) return;
      dispose = createAtomScene(canvas);
    });

    cleanup(() => {
      cancelled = true;
      dispose?.();
    });
  });

  return (
    <div class={styles["fixed"]} aria-hidden="true">
      <canvas ref={canvasRef} class={styles["canvas"]}></canvas>
    </div>
  );
});
