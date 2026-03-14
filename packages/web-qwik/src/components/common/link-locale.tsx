import { component$, PropsOf, Slot, useContext } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
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
