import styles from "./date.module.css";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/solid";
import { mdiCalendarClock, mdiCalendarEdit } from "@mdi/js";

export interface DateProps {
  createdAt: string;
  updatedAt: string;
}

export function DateComponent(props: DateProps) {
  return (
    <div class={styles.date}>
      <ElmMdiIcon class={styles.icon} d={mdiCalendarEdit} size="1rem" />
      <ElmInlineText size="0.85rem">
        {props.createdAt.substring(0, 10)}
      </ElmInlineText>
      <ElmMdiIcon class={styles.icon} d={mdiCalendarClock} size="1rem" />
      <ElmInlineText size="0.85rem">
        {props.updatedAt.substring(0, 10)}
      </ElmInlineText>
    </div>
  );
}
