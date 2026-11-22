import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { useI18n } from "~/i18n/context";

export type LinkLocaleProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function LinkLocale(props: LinkLocaleProps) {
  const { locale, localizePath } = useI18n();
  const rest = omit(props, "href");

  return <a {...rest} hreflang={locale()} href={localizePath(props.href)} />;
}
