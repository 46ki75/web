import { component$ } from "@builder.io/qwik";
import { ElmInlineText } from "@elmethis/qwik";

import GitHubIcon from "../../assets/icons/github.svg?jsx";
import XIcon from "../../assets/icons/x.svg?jsx";
import PixivIcon from "../../assets/icons/pixiv.svg?jsx";
import LinkedInIcon from "../../assets/icons/linkedin.svg?jsx";
import EmailIcon from "../../assets/icons/email.svg?jsx";

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
      <div class={styles["link-container"]}>
        {links.map((link) => (
          <a
            key={link.text}
            class={styles["link"]}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <link.image width={40} height={40} class={styles["link-icon"]} />
            <ElmInlineText size="0.75rem">{link.text}</ElmInlineText>
          </a>
        ))}
      </div>
    </>
  );
});
