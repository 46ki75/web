import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./header.scoped.scss?inline";

export interface HeaderProps {}

export const Header = component$<HeaderProps>(({}) => {
  useStylesScoped$(styles);
  return <header class="header">HEADER</header>;
});
