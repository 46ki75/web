import { component$, Slot } from "@qwik.dev/core";

import styles from "./main-container.module.css";

export const MainContainer = component$(() => {
  return (
    <div class={styles["main"]}>
      <div class={styles["main-inner"]}>
        <Slot />
      </div>
    </div>
  );
});
