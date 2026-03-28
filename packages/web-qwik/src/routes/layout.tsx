import { component$, Slot } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import { ElmPageTop, ElmParallax } from "@elmethis/qwik";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";

import bgBlue from "~/assets/parallax/bg-blue.webp?url";
import bgEmerald from "~/assets/parallax/bg-emerald.webp?url";

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

      <ElmParallax images={[bgBlue, bgEmerald]} />

      <Footer />

      <ElmPageTop />
    </>
  );
});
