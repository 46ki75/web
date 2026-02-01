<template>
  <a
    ref="noopener noreferrer"
    :class="$style.badge"
    :href="href"
    target="_blank"
  >
    <ElmImage
      :class="$style.image"
      :src="src"
      :alt="alt"
      :enable-modal="false"
      :block="false"
    />

    <div :class="$style.p">{{ name }}</div>

    <div :class="$style.grid">
      <Icon icon="mingcute:certificate-line" height=".5rem" color="gray" />
      <ElmInlineText size=".5rem" text="Issued" />
      <ElmInlineText size=".5rem" :text="issued_at_date" />
      <Icon icon="ix:certificate-exclamation" height=".5rem" color="gray" />
      <ElmInlineText size=".5rem" text="Expires" />
      <ElmInlineText size=".5rem" :text="expires_at_date ?? '-'" />
    </div>
  </a>
</template>

<script setup lang="ts">
import { ElmImage, ElmInlineText } from "@elmethis/vue";
import { Icon } from "@iconify/vue";

export interface CredlyBadgeProps {
  name: string;
  src: string;
  alt: string;
  href: string;
  // eslint-disable-next-line vue/prop-name-casing
  issued_at_date: string;
  // eslint-disable-next-line vue/prop-name-casing
  expires_at_date?: string | null;
}

withDefaults(defineProps<CredlyBadgeProps>(), {
  expires_at_date: "-",
});
</script>

<style module lang="scss">
.badge {
  all: unset;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  max-width: 7rem;
  opacity: 1;
  transition: opacity 200ms;
  cursor: pointer;
  flex-grow: 1;

  &:hover {
    opacity: 0.8;
  }
}

.image {
  box-sizing: border-box;
  padding: 0.5rem;
}

.p {
  font-size: 0.5rem;
  line-height: 0.75rem;
  font-weight: bold;
  margin: 0;
  padding: 0.25rem 0;
  box-sizing: border-box;
  height: 3rem;
  text-align: center;
  color: #393f48;

  [data-theme="dark"] & {
    color: #adb3be;
  }
}

.grid {
  opacity: 0.7;
  display: grid;
  place-items: center;
  grid-template-columns: 1fr 5fr 7fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.25rem 0;
}
</style>
