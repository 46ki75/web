import { component$ } from "@builder.io/qwik";

import styles from "./tag.module.scss";
import { ElmInlineIcon, ElmInlineText } from "@elmethis/qwik";

export interface TagProps {
  name: string;
  src: string;
}

export const Tag = component$<TagProps>(({ name, src }) => {
  return (
    <span class={styles["tag"]}>
      <ElmInlineIcon src={src} />
      <ElmInlineText>{name}</ElmInlineText>
    </span>
  );
});
