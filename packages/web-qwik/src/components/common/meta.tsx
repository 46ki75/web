import type { ElmBreadcrumbProps } from "@elmethis/solid";
import type { ParentProps } from "solid-js";

import styles from "./meta.module.css";
import { ElmBlockImage, ElmBreadcrumb, ElmHeading } from "@elmethis/solid";

import { DateComponent } from "./date";

export interface MetaProps {
  title: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
  links: ElmBreadcrumbProps["links"];
}

export function Meta(props: ParentProps<MetaProps>) {
  return (
    <div>
      <ElmBreadcrumb links={props.links} />

      <hr class={styles.divider} />

      <ElmHeading level={1}>{props.title}</ElmHeading>
      <div class={styles["date-container"]}>
        <DateComponent
          createdAt={props.createdAt}
          updatedAt={props.updatedAt}
        />
      </div>

      {props.children}

      {props.image && (
        <ElmBlockImage
          src={props.image}
          alt={`OGP ${props.title}`}
          width={1200}
          height={630}
        />
      )}
    </div>
  );
}
