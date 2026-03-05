import { component$, PropsOf, Slot } from "@builder.io/qwik";

import styles from "./meta.module.scss";
import { ElmBlockImage, ElmBreadcrumb, ElmHeading } from "@elmethis/qwik";

import { Date } from "./date";

export interface MetaProps {
  title: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
  links: PropsOf<typeof ElmBreadcrumb>["links"];
}

export const Meta = component$<MetaProps>(
  ({ title, createdAt, updatedAt, image, links }) => {
    return (
      <div>
        <ElmBreadcrumb links={links} />

        <ElmHeading level={1}>{title}</ElmHeading>
        <div class={styles["date-container"]}>
          <Date createdAt={createdAt} updatedAt={updatedAt} />
        </div>

        <Slot />

        {image && (
          <ElmBlockImage
            src={image}
            alt={`OGP ${title}`}
            width={1140}
            height={600}
          />
        )}
      </div>
    );
  },
);
