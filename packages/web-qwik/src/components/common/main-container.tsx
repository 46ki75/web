import { component$, Slot } from "@qwik.dev/core";

import styles from "./main-container.module.scss";

export const MainContainer = component$(() => {
  return (
    <div class={styles["main"]}>
      <div class={styles["main-inner"]}>
        <Slot />
      </div>
    </div>
  );
});
