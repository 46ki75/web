import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./footer.scoped.scss?inline";

export type FooterProps = object;

export const Footer = component$<FooterProps>(() => {
  useStylesScoped$(styles);
  return <footer class="footer"></footer>;
});
