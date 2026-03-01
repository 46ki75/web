import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./header.scoped.scss?inline";
import { Link } from "@builder.io/qwik-city";

import Favicon from "../../../public/static/brand/logo.svg?jsx";

export const Header = component$(() => {
  useStylesScoped$(styles);
  return (
    <header class="header">
      <Link href="/">
        <Favicon style={{ height: "1.5rem" }} />
      </Link>
    </header>
  );
});
