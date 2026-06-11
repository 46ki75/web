import { component$, Slot } from "@qwik.dev/core";
import { RequestHandler } from "@qwik.dev/router";
import { ElmPageTop, ElmParallax } from "@elmethis/qwik";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";

import amber from "~/assets/parallax/bg-amber.webp?url";
import gold from "~/assets/parallax/bg-gold.webp?url";

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

      <ElmParallax images={[amber, gold]} />

      <Footer />

      <ElmPageTop />
    </>
  );
});
