import { component$ } from "@builder.io/qwik";

import styles from "./header.module.scss";

import Favicon from "../../../public/static/brand/logo.svg?jsx";
import { ElmToggleTheme } from "@elmethis/qwik";
import { Language } from "./language";
import { LinkLocale } from "./link-locale";

export const Header = component$(() => {
  return (
    <header class={styles.header}>
      <LinkLocale href="/">
        <Favicon style={{ height: "1.5rem", width: "min-content" }} />
      </LinkLocale>

      <Language />

      <ElmToggleTheme />
    </header>
  );
});
