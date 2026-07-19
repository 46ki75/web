import type { JSX } from "solid-js";

import styles from "./tag.module.css";
import { ElmInlineIcon, ElmInlineText } from "@elmethis/solid";

export interface TagProps {
  style?: JSX.CSSProperties;
  name: string;
  src: string;
}

export function Tag(props: TagProps) {
  return (
    <span class={styles["tag"]} style={props.style}>
      <ElmInlineIcon src={props.src} alt={`Icon of ${props.name}`} />
      <ElmInlineText style={{ "white-space": "nowrap" }}>
        {props.name}
      </ElmInlineText>
    </span>
  );
}
