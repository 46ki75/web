import { component$ } from "@qwik.dev/core";

import styles from "./date.module.css";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiCalendarClock, mdiCalendarEdit } from "@mdi/js";

export interface DateProps {
  createdAt: string;
  updatedAt: string;
}

export const DateComponent = component$<DateProps>(
  ({ createdAt, updatedAt }) => {
    return (
      <div class={styles.date}>
        <ElmMdiIcon class={styles.icon} d={mdiCalendarEdit} size="1rem" />
        <ElmInlineText size="0.85rem">
          {createdAt.substring(0, 10)}
        </ElmInlineText>
        <ElmMdiIcon class={styles.icon} d={mdiCalendarClock} size="1rem" />
        <ElmInlineText size="0.85rem">
          {updatedAt.substring(0, 10)}
        </ElmInlineText>
      </div>
    );
  },
);
