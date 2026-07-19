import type { ParentProps } from "solid-js";

import styles from "./main-container.module.css";

export function MainContainer(props: ParentProps) {
  return (
    <div class={styles["main"]}>
      <div class={styles["main-inner"]}>{props.children}</div>
    </div>
  );
}
