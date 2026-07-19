import { ElmPageTop, ElmParallax } from "@elmethis/solid";
import type { RouteSectionProps } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";
import { createMemo, Show } from "solid-js";

import amber from "~/assets/parallax/bg-amber.webp?url";
import gold from "~/assets/parallax/bg-gold.webp?url";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";
import { I18nProvider } from "~/i18n/context";
import { localeFromRouteParam } from "~/i18n/locale";

export default function LocaleLayout(props: RouteSectionProps) {
  const locale = createMemo(() => localeFromRouteParam(props.params.lang));

  return (
    <Show
      when={locale()}
      keyed
      fallback={
        <main>
          <HttpStatusCode code={404} text="Not Found" />
          <h1>Not Found</h1>
        </main>
      }
    >
      {(resolvedLocale) => (
        <I18nProvider locale={() => resolvedLocale}>
          <Header />
          <main style={{ "view-transition-name": "main-content" }}>
            {props.children}
          </main>
          <ElmParallax images={[amber, gold]} style={{ isolation: "auto" }} />
          <Footer />
          <ElmPageTop />
        </I18nProvider>
      )}
    </Show>
  );
}
