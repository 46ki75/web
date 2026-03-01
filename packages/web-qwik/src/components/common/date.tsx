import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./date.scoped.scss?inline";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiCalendarClock, mdiCalendarEdit } from "@mdi/js";

export interface DateProps {
  createdAt: string;
  updatedAt: string;
}

export const Date = component$<DateProps>(({ createdAt, updatedAt }) => {
  useStylesScoped$(styles);
  return (
    <div class="date">
      <ElmMdiIcon d={mdiCalendarEdit} color="#a17c5b" size="1.25rem" />
      <ElmInlineText size="0.85rem">{createdAt}</ElmInlineText>
      <ElmMdiIcon d={mdiCalendarClock} color="#a17c5b" size="1.25rem" />
      <ElmInlineText size="0.85rem">{updatedAt}</ElmInlineText>
    </div>
  );
});
