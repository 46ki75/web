import { component$, CSSProperties } from "@builder.io/qwik";

import styles from "./tag.module.css";
import { ElmInlineIcon, ElmInlineText } from "@elmethis/qwik";

export interface TagProps {
  style?: CSSProperties;
  name: string;
  src: string;
}

export const Tag = component$<TagProps>(({ name, src, style }) => {
  return (
    <span class={styles["tag"]} style={style}>
      <ElmInlineIcon src={src} alt={`Icon of ${name}`} />
      <ElmInlineText style={{ whiteSpace: "nowrap" }}>{name}</ElmInlineText>
    </span>
  );
});
