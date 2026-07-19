import styles from "./home.module.css";
import { LayerDecoration } from "./layer-decoration";
import { About } from "./about";

export function Home() {
  return (
    <div class={styles["home"]}>
      <div class={styles["about"]}>
        <About />
      </div>
      <div />
      <LayerDecoration />
    </div>
  );
}
