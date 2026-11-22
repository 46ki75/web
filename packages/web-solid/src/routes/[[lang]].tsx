import { ElmPageTop, ElmParallax } from "@elmethis/solid";
import type { RouteProps } from "@solidjs/router";
import { createMemo, Show } from "solid-js";

import amber from "~/assets/parallax/bg-amber.webp?url";
import gold from "~/assets/parallax/bg-gold.webp?url";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";
import { NotFound } from "~/components/common/not-found";
import { I18nProvider } from "~/i18n/context";
import { localeFromRouteParam } from "~/i18n/locale";

export default function LocaleLayout(props: RouteProps<"/:lang?">) {
  const locale = createMemo(() => localeFromRouteParam(props.params.lang));

  return (
    <Show
      when={locale()}
      keyed
      fallback={
        <main>
          <NotFound />
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
