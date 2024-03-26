<template>
  <div class="tag" :style="{ background: getColor(color) }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="16"
      viewBox="0 0 640 512"
    >
      <path
        d="M497.9 225.9L286.1 14.1A48 48 0 0 0 252.1 0H48C21.5 0 0 21.5 0 48v204.1a48 48 0 0 0 14.1 33.9l211.9 211.9c18.7 18.7 49.1 18.7 67.9 0l204.1-204.1c18.7-18.7 18.7-49.1 0-67.9zM112 160c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm513.9 133.8L421.8 497.9c-18.7 18.7-49.1 18.7-67.9 0l-.4-.4L527.6 323.5c17-17 26.4-39.6 26.4-63.6s-9.4-46.6-26.4-63.6L331.4 0h48.7a48 48 0 0 1 33.9 14.1l211.9 211.9c18.7 18.7 18.7 49.1 0 67.9z"
        opacity="0.7"
      />
    </svg>
    <span
      ><a :href="href">{{ label }}</a></span
    >
  </div>
</template>

<script setup lang="ts">
import type { ColorFG } from 'notion-markup-utils'

const getColor = (color: ColorFG): string => {
  if (color === 'default') return '#e7e5e4'
  if (color === 'blue') return '#bfdbfe'
  if (color === 'brown') return '#fde68a'
  if (color === 'gray') return '#d6d3d1'
  if (color === 'green') return '#bbf7d0'
  if (color === 'orange') return '#fed7aa'
  if (color === 'pink') return '#fbcfe8'
  if (color === 'purple') return '#f3e8ff'
  if (color === 'red') return '#fecaca'
  if (color === 'yellow') return '#fef08a'
  return '#e7e5e4'
}

withDefaults(
  defineProps<{
    label: string
    href: string
    color?: ColorFG
  }>(),
  { color: 'default' }
)
</script>

<style scoped lang="scss">
.tag {
  padding: 0.25rem 0.5rem;
  width: min-content;

  background-color: rgb(194, 206, 231);
  border-radius: 0.25rem;

  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;

  transition: all 0.12s;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.5;
  }

  span {
    user-select: none;

    a {
      all: unset;
    }
  }
}
</style>
