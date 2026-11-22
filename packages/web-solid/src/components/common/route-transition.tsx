import { useBeforeLeave, useIsRouting } from "@solidjs/router";
import { flush, until, type ParentProps } from "solid-js";

export function RouteTransition(props: ParentProps) {
  const isRouting = useIsRouting();

  useBeforeLeave((event) => {
    if (
      event.defaultPrevented ||
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    event.preventDefault();

    document.startViewTransition(async () => {
      // Flush the staged navigation before checking whether it needs to wait.
      flush(() => event.retry(true));
      await until(() => !isRouting());
    });
  });

  return <>{props.children}</>;
}
