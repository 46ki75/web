import { component$ } from "@builder.io/qwik";

import styles from "./header.module.scss";
import { Link } from "@builder.io/qwik-city";

import Favicon from "../../../public/static/brand/logo.svg?jsx";
import { ElmToggleTheme } from "@elmethis/qwik";

export const Header = component$(() => {
  return (
    <header class={styles.header}>
      <Link href="/">
        <Favicon style={{ height: "1.5rem", width: "min-content" }} />
      </Link>

      <ElmToggleTheme />
    </header>
  );
});
