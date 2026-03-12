import { component$ } from "@builder.io/qwik";

import styles from "./home.module.scss";
import { LayerDecoration } from "./layer-decoration";
import type { Language } from "~/types";

export type HomeProps = {
  language: Language;
};

export const Home = component$<HomeProps>(() => {
  return (
    <div class={styles["home"]}>
      <div class={styles["about"]}></div>
      <div></div>
      <LayerDecoration />
    </div>
  );
});
