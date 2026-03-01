import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { Header } from "~/components/common/header";

export default component$(() => {
  useStyles$(`
    ::view-transition-old(root) {
      animation: fade-out 200ms ease-out;
    }
    ::view-transition-new(root) {
      animation: fade-in 200ms ease-in;
    }
    @keyframes fade-out {
      to { opacity: 0; }
    }
    @keyframes fade-in {
      from { opacity: 0; }
    }
  `);

  return (
    <>
      <Header />
      <div>
        <Slot />
      </div>
    </>
  );
});
