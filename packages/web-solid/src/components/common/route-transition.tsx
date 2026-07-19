import { useBeforeLeave, useIsRouting } from "@solidjs/router";
import {
  type Accessor,
  createRenderEffect,
  createRoot,
  type ParentProps,
} from "solid-js";

const waitForRouting = (isRouting: Accessor<boolean>) =>
  new Promise<void>((resolve) => {
    let started = false;

    createRoot((dispose) => {
      createRenderEffect(() => {
        if (isRouting()) {
          started = true;
        } else if (started) {
          dispose();
          resolve();
        }
      });
    });
  });

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
      const routingFinished = waitForRouting(isRouting);
      event.retry(true);
      await routingFinished;
    });
  });

  return <>{props.children}</>;
}
