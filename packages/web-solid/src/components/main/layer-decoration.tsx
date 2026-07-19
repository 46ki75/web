import { onCleanup, onMount } from "solid-js";

import styles from "./layer-decoration.module.css";

export function LayerDecoration() {
  let canvasRef!: HTMLCanvasElement;

  // WebGL is browser-only: spin it up on mount and tear it down when the
  // component unmounts. `three` stays out of the SSR and initial client bundle.
  onMount(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    import("./atom-scene").then(({ createAtomScene }) => {
      if (cancelled) return;
      dispose = createAtomScene(canvasRef);
    });

    onCleanup(() => {
      cancelled = true;
      dispose?.();
    });
  });

  return (
    <div class={styles["fixed"]} aria-hidden="true">
      <canvas ref={canvasRef} class={styles["canvas"]} />
    </div>
  );
}
