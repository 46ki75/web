import { component$ } from "@builder.io/qwik";

import styles from "./date.module.scss";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiCalendarClock, mdiCalendarEdit } from "@mdi/js";

export interface DateProps {
  createdAt: string;
  updatedAt: string;
}

export const Date = component$<DateProps>(({ createdAt, updatedAt }) => {
  return (
    <div class={styles.date}>
      <ElmMdiIcon d={mdiCalendarEdit} color="#a17c5b" size="1.25rem" />
      <ElmInlineText size="0.85rem">{createdAt.substring(0, 10)}</ElmInlineText>
      <ElmMdiIcon d={mdiCalendarClock} color="#a17c5b" size="1.25rem" />
      <ElmInlineText size="0.85rem">{updatedAt.substring(0, 10)}</ElmInlineText>
    </div>
  );
});
