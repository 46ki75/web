import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import appleTouchIcon from "~/assets/brand/apple-touch-icon.png?url";
import favicon from "~/assets/brand/favicon.png?url";
import { RouteTransition } from "~/components/common/route-transition";

import "./global.css";
import "@elmethis/solid/style.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>FineNight</Title>
          <Link rel="icon" href={favicon} />
          <Link rel="apple-touch-icon" href={appleTouchIcon} />
          <RouteTransition>
            <Suspense>{props.children}</Suspense>
          </RouteTransition>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
