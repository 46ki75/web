import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { animate } from "motion";
import { Header } from "~/components/common/header";

export default component$(() => {
  const loc = useLocation();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const isNavigating = track(() => loc.isNavigating);

    if (isNavigating) {
      // Page leaving
      animate("#page-wrapper", { opacity: 0, x: -10 }, { duration: 0.2 });
    } else {
      // Page entered
      animate("#page-wrapper", { opacity: 1, x: 0 }, { duration: 0.2 });
    }
  });

  return (
    <>
      <Header />
      <div id="page-wrapper" style={{ opacity: 0 }}>
        <Slot />
      </div>
    </>
  );
});
