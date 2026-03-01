import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import { ElmCodeBlock, ElmInlineText } from "@elmethis/qwik";
import code from "../../../../crates/web-lambda-http-api/src/lib.rs?raw";

export default component$(() => {
  return (
    <>
      {/* <ElmHeading level={1}>Hi 👋</ElmHeading> */}
      <div>
        <ElmInlineText>
          Can't wait to see what you build with qwik!
        </ElmInlineText>

        <ElmCodeBlock language="rust" code={code}></ElmCodeBlock>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
