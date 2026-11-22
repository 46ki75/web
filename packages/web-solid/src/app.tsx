import { Link, Title } from "@solidjs/meta";
import { createRouter, intentPreload } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";
import { Loading } from "solid-js";
import { pageRoutes } from "virtual:file-routes";

import appleTouchIcon from "~/assets/brand/apple-touch-icon.png?url";
import favicon from "~/assets/brand/favicon.png?url";
import { RouteTransition } from "~/components/common/route-transition";
import { NotFound } from "~/components/common/not-found";

import "./global.css";
import "@elmethis/solid/style.css";

const Router = createRouter({
  routes: [...fileRoutes(pageRoutes), { path: "*404", component: NotFound }],
  preloadLinks: intentPreload(),
});

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>FineNight</Title>
          <Link rel="icon" href={favicon} />
          <Link rel="apple-touch-icon" href={appleTouchIcon} />
          <RouteTransition>
            <Loading>{props.children}</Loading>
          </RouteTransition>
        </>
      )}
    </Router>
  );
}
