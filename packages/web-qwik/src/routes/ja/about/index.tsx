import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

export const useRedirect = routeLoader$(({ redirect }) => {
  throw redirect(308, "/ja");
});

// A default export is still required for the route to exist
export default component$(() => <></>);
