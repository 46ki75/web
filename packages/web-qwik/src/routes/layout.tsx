import { component$, Slot } from "@builder.io/qwik";
import {
  DocumentHead,
  RequestHandler,
  routeLoader$,
} from "@builder.io/qwik-city";
import { ElmPageTop, ElmParallax } from "@elmethis/qwik";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";

export const onGet: RequestHandler = ({ cacheControl }) => {
  cacheControl({
    public: true,
    maxAge: 60,
    sMaxAge: 365 * 24 * 60 * 60,
  });
};

export default component$(() => {
  return (
    <>
      <Header />
      <div class="routing-transition">
        <Slot />
      </div>

      <ElmParallax
        images={[
          "/static/image/bg-crimson.webp",
          "/static/image/bg-amber.webp",
        ]}
      />

      <Footer />

      <ElmPageTop />
    </>
  );
});

export const useUrl = routeLoader$(({ url }) => url.toString());

export const head: DocumentHead = ({ resolveValue }) => {
  const url = resolveValue(useUrl);

  return {
    title: "SrcJar",
    meta: [
      { name: "description", content: "Personal blog and portfolio" },
      { property: "og:title", content: "SrcJar" },
      { property: "og:description", content: "Personal blog and portfolio" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
  };
};
