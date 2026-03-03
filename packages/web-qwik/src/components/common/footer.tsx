import { component$ } from "@builder.io/qwik";

import styles from "./footer.module.scss";

export type FooterProps = object;

export const Footer = component$<FooterProps>(() => {
  return <footer class={styles.footer}></footer>;
});
