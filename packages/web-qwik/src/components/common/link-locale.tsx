import { component$, PropsOf, Slot, useContext } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import { LanguageContext } from "~/context/language";

export type LinkLocaleProps = PropsOf<typeof Link>;

export const LinkLocale = component$<LinkLocaleProps>((props) => {
  const languageState = useContext(LanguageContext);

  return (
    <Link
      {...props}
      hreflang={languageState.language}
      href={
        languageState.language === "en"
          ? props.href
          : `/${languageState.language}${props.href}`
      }
    >
      <Slot />
    </Link>
  );
});
