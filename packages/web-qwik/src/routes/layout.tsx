import { component$, Slot } from "@qwik.dev/core";
import { RequestHandler } from "@qwik.dev/router";
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

      <div
        style={{
          viewTransitionName: "main-content",
        }}
      >
        <Slot />
      </div>

      <ElmParallax images={[bgBlue, bgEmerald]} />

      <Footer />

      <ElmPageTop />
    </>
  );
});
