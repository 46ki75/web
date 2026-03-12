import { component$ } from "@builder.io/qwik";

import styles from "./layer-decoration.module.scss";

export type LayerDecorationProps = object;

export const LayerDecoration = component$<LayerDecorationProps>(() => {
  return (
    <div class={styles["layer-decoration"]}>
      <div class={styles["layer-green"]}></div>
      <div class={styles["layer-cyan"]}></div>
      <div class={styles["layer-blue"]}></div>
      <div class={styles["layer-purple"]}></div>
      <div class={styles["layer-pink"]}></div>
    </div>
  );
});
