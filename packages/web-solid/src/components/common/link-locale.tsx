import { A, type AnchorProps } from "@solidjs/router";
import { splitProps } from "solid-js";
import { useI18n } from "~/i18n/context";

export type LinkLocaleProps = AnchorProps;

export function LinkLocale(props: LinkLocaleProps) {
  const { locale, localizePath } = useI18n();
  const [local, rest] = splitProps(props, ["href", "children"]);

  return (
    <A {...rest} hreflang={locale()} href={localizePath(local.href)}>
      {local.children}
    </A>
  );
}
