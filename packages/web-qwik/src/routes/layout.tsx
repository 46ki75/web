import { component$, Slot } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import { ElmPageTop, ElmParallax } from "@elmethis/qwik";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";

export const onGet: RequestHandler = ({ cacheControl }) => {
  cacheControl({
    public: true,
    maxAge: 60 * 10,
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
