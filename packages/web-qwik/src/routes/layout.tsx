import { component$, Slot } from "@builder.io/qwik";
import { ElmParallax } from "@elmethis/qwik";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";

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
    </>
  );
});
