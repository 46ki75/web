import { routeLoader$ } from "@qwik.dev/router";
import { component$ } from "@qwik.dev/core";

export const useRedirect = routeLoader$(({ redirect }) => {
  throw redirect(308, "/");
});

// A default export is still required for the route to exist
export default component$(() => <></>);
