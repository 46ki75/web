import { component$ } from "@qwik.dev/core";

import styles from "./layer-decoration.module.css";

export type LayerDecorationProps = object;

export const LayerDecoration = component$<LayerDecorationProps>(() => {
  return (
    <div class={styles["fixed"]}>
      <div class={styles["layer-decoration"]}>
        <div class={styles["layer-green"]}></div>
        <div class={styles["layer-cyan"]}></div>
        <div class={styles["layer-blue"]}></div>
        <div class={styles["layer-purple"]}></div>
        <div class={styles["layer-pink"]}></div>
      </div>
    </div>
  );
});
