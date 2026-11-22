import { httpStatus } from "@solidjs/web";
import type { ParentProps } from "solid-js";

export function NotFound(props: ParentProps) {
  httpStatus(404, "Not Found");
  return (
    <>
      {props.children}
      <h1>Not Found</h1>
    </>
  );
}
