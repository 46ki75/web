import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./header.scoped.scss?inline";

export const Header = component$(() => {
  useStylesScoped$(styles);
  return <header class="header">HEADER</header>;
});
