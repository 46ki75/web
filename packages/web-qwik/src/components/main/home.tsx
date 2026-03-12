import { component$ } from "@builder.io/qwik";

import styles from "./home.module.scss";
import { LayerDecoration } from "./layer-decoration";
import type { Language } from "~/types";
import { About } from "./about";

export type HomeProps = {
  language: Language;
};

export const Home = component$<HomeProps>(({ language }) => {
  return (
    <div class={styles["home"]}>
      <div class={styles["about"]}>
        <About language={language} />
      </div>
      <div></div>
      <LayerDecoration />
    </div>
  );
});
