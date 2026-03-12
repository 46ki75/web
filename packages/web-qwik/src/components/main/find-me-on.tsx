import { component$ } from "@builder.io/qwik";
import { ElmHeading, ElmInlineText } from "@elmethis/qwik";

import GitHubIcon from "../../assets/icons/github.svg?url";
import XIcon from "../../assets/icons/x.svg?url";
import PixivIcon from "../../assets/icons/pixiv.svg?url";
import LinkedInIcon from "../../assets/icons/linkedin.svg?url";
import EmailIcon from "../../assets/icons/email.svg?url";

import styles from "./find-me-on.module.scss";

const links = [
  {
    text: "GitHub",
    href: "https://github.com/46ki75",
    image: GitHubIcon,
  },
  {
    text: "X",
    href: "https://x.com/ikuma_cloud",
    image: XIcon,
  },
  {
    text: "Pixiv",
    href: "https://www.pixiv.net/en/users/120506329",
    image: PixivIcon,
  },
  {
    text: "LinkedIn",
    href: "https://www.linkedin.com/in/ikuma-yamashita-b3080a344/",
    image: LinkedInIcon,
  },
  {
    text: "Email",
    href: "mailto:me@ikuma.cloud",
    image: EmailIcon,
  },
];

export const FindMeOn = component$(() => {
  return (
    <>
      <ElmHeading level={2} style={{ "--margin-block": "2rem" }}>
        Find me on
      </ElmHeading>

      <div class={styles["link-container"]}>
        {links.map((link) => (
          <a
            key={link.text}
            class={styles["link"]}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img width={40} height={40} src={link.image} alt={link.text} />
            <ElmInlineText size="0.75rem">{link.text}</ElmInlineText>
          </a>
        ))}
      </div>
    </>
  );
});
