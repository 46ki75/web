import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./meta.scoped.scss?inline";
import { ElmBlockImage, ElmHeading } from "@elmethis/qwik";

import { Date } from "./date";

export interface MetaProps {
  title: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
}

export const Meta = component$<MetaProps>(
  ({ title, createdAt, updatedAt, image }) => {
    useStylesScoped$(styles);
    return (
      <div>
        <ElmHeading level={1}>{title}</ElmHeading>
        <div class="date-container">
          <Date createdAt={createdAt} updatedAt={updatedAt} />
        </div>

        {image && <ElmBlockImage src={image} alt={`OGP ${title}`} />}
      </div>
    );
  },
);
