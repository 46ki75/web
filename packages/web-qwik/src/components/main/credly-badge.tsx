import { component$ } from "@builder.io/qwik";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiCertificateOutline, mdiAlertCircleOutline } from "@mdi/js";
import styles from "./credly-badge.module.scss";

export interface CredlyBadgeProps {
  name: string;
  src: string;
  alt: string;
  href: string;
  issued_at_date: string;
  expires_at_date?: string | null;
  delay: number;
}

export const CredlyBadge = component$<CredlyBadgeProps>(
  ({ name, src, alt, href, issued_at_date, expires_at_date = "-", delay }) => {
    return (
      <a
        class={styles.badge}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ "--delay": `${delay}ms` }}
      >
        <img
          class={styles.image}
          src={src}
          alt={alt}
          width={100}
          height={100}
        />

        <div class={styles.p}>{name}</div>

        <div class={styles.grid}>
          <ElmMdiIcon d={mdiCertificateOutline} size="0.5rem" color="gray" />
          <ElmInlineText size=".5rem">Issued</ElmInlineText>
          <ElmInlineText size=".5rem">{issued_at_date}</ElmInlineText>

          <ElmMdiIcon d={mdiAlertCircleOutline} size="0.5rem" color="gray" />
          <ElmInlineText size=".5rem">Expires</ElmInlineText>
          <ElmInlineText size=".5rem">{expires_at_date ?? "-"}</ElmInlineText>
        </div>
      </a>
    );
  },
);
