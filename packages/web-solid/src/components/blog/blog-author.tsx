import { ElmInlineText, ElmParagraph } from "@elmethis/solid";

import { useI18n } from "~/i18n/context";
import githubIconUrl from "../../assets/icons/github.svg?url";
import profileIconUrl from "../../assets/icons/profile-icon.webp?url";

import styles from "./blog-author.module.css";

export function BlogAuthor() {
  const { t } = useI18n();

  return (
    <div class={styles.author}>
      <img
        class={styles.icon}
        src={profileIconUrl}
        alt="Profile Icon"
        width={512}
        height={512}
      />
      <ElmInlineText bold size="1.1rem">
        Ikuma Yamashita
      </ElmInlineText>
      <div class={styles.content}>
        <ElmParagraph>{t("blog.authorIntroduction")}</ElmParagraph>
      </div>
      <div class={styles.links}>
        <a
          href="https://github.com/46ki75"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <img
            class={styles["link-icon"]}
            src={githubIconUrl}
            alt=""
            width={32}
            height={32}
          />
        </a>
      </div>
    </div>
  );
}
