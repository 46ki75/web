import styles from "./about.module.css";

import { ElmInlineText, ElmMdiIcon, ElmParagraph } from "@elmethis/solid";
import { FindMeOn } from "./find-me-on";

import Signature from "~/assets/image/signature.webp?url";
import { mdiChevronRight } from "@mdi/js";
import { LinkLocale } from "../common/link-locale";
import { useI18n } from "~/i18n/context";

export function About() {
  const { locale, t } = useI18n();

  return (
    <div class={styles["about"]}>
      <div>
        <h1>
          <ElmInlineText size="2.125rem">{t("about.greeting")}</ElmInlineText>
        </h1>

        {locale() === "en" ? (
          <>
            <ElmParagraph>I'm Ikuma Yamashita (山下 生真).</ElmParagraph>
            <ElmParagraph>
              I usually work as an infrastructure-focused cloud engineer using
              AWS. I do not have a particular favorite IaC tool, but for work I
              often use Terraform/OpenTofu, AWS CDK, Pulumi, and Ansible.
            </ElmParagraph>
            <ElmParagraph>
              Technically, I enjoy understanding the underlying mechanisms, such
              as the Linux kernel and network protocols. My main areas are
              systems programming and the web. I especially like{" "}
              <strong class={styles["strong"]}>Rust</strong>, and as a hobby I
              contribute to OSS projects, including the AWS Lambda Rust runtime.
            </ElmParagraph>
            <ElmParagraph>
              On the frontend, I went from Angular to React to Vue.js, and now I
              am drawn to{" "}
              <strong class={styles["strong"]}>SolidJS / SolidStart</strong>.
              This site is also built with SolidStart. Besides technical posts,
              I also casually update the blog with illustrations and other
              miscellaneous topics.
            </ElmParagraph>
            <ElmParagraph>I am currently based in Tokyo.</ElmParagraph>
          </>
        ) : (
          <>
            <ElmParagraph>Ikuma Yamashita (山下 生真)です。</ElmParagraph>
            <ElmParagraph>
              AWSを使ったインフラ寄りのクラウドエンジニアとして仕事をしています。IaC
              は特に好きなものは無いですが仕事では Terraform/OpenTofu, AWS CDK,
              Pulumi, Ansibleなどを使うことが多いです。
            </ElmParagraph>
            <ElmParagraph>
              技術的には、Linuxカーネルやネットワークプロトコルのような基底の仕組みを理解するのが好きで、システムプログラミングと
              Web が主戦場です。特に{" "}
              <strong class={styles["strong"]}>Rust</strong> が好きで、趣味では
              AWS Lambda の Rust ランタイムをはじめとする OSS
              のコントリビューターです。
            </ElmParagraph>
            <ElmParagraph>
              フロントエンドはAngular→React→Vue.jsを経て、いまは{" "}
              <strong class={styles["strong"]}>SolidJS / SolidStart</strong>{" "}
              に魅力を感じ、このサイトもSolidStartで作っています。技術記事だけでなく、イラストなど雑多な内容も気ままに更新します。
            </ElmParagraph>
            <ElmParagraph>現在の活動拠点は東京です。</ElmParagraph>
          </>
        )}

        <LinkLocale href="/blog" class={styles["blog-link-container"]}>
          <div class={styles["blog-link-container-inner"]}>
            <span class={styles["blog-link-text"]}>{t("common.readBlog")}</span>
            <ElmMdiIcon d={mdiChevronRight} class={styles["blog-link-icon"]} />
          </div>
        </LinkLocale>

        <div class={styles["signature-container"]}>
          <img
            class={styles["signature"]}
            src={Signature}
            alt="Signature"
            width={1024}
            height={512}
          />
        </div>

        <FindMeOn />
      </div>
    </div>
  );
}
