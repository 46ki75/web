<template>
  <div class="date-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="16"
      viewBox="0 0 448 512"
    >
      <path
        d="M436 160H12c-6.6 0-12-5.4-12-12v-36c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48v36c0 6.6-5.4 12-12 12zM12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm333.3 95.9l-28.2-28.4c-4.7-4.7-12.3-4.7-17-.1L194.1 364.7l-46-46.4c-4.7-4.7-12.3-4.7-17-.1l-28.4 28.2c-4.7 4.7-4.7 12.3-.1 17l82.6 83.3c4.7 4.7 12.3 4.7 17 .1l143-141.8c4.7-4.7 4.7-12.3 .1-17z"
      />
    </svg>

    <span>{{ formatedCreatedAt }}</span>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 512 512"
    >
      <path
        d="M504 255.5c.3 136.6-111.2 248.4-247.8 248.5-59 0-113.2-20.5-155.8-54.9-11.1-8.9-11.9-25.5-1.8-35.6l11.3-11.3c8.6-8.6 22.4-9.6 31.9-2C173.1 425.1 212.8 440 256 440c101.7 0 184-82.3 184-184 0-101.7-82.3-184-184-184-48.8 0-93.1 19-126.1 49.9l50.8 50.8c10.1 10.1 2.9 27.3-11.3 27.3H24c-8.8 0-16-7.2-16-16V38.6c0-14.3 17.2-21.4 27.3-11.3l49.4 49.4C129.2 34.1 189.6 8 256 8c136.8 0 247.7 110.8 248 247.5zm-180.9 78.8l9.8-12.6c8.1-10.5 6.3-25.5-4.2-33.7L288 256.3V152c0-13.3-10.7-24-24-24h-16c-13.3 0-24 10.7-24 24v135.7l65.4 50.9c10.5 8.1 25.5 6.3 33.7-4.2z"
      />
    </svg>

    <span>{{ formatedUpdatedAt }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  createdAt: string
  updatedAt: string
}>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatedCreatedAt = computed(() => formatDate(props.createdAt))
const formatedUpdatedAt = computed(() => formatDate(props.updatedAt))
</script>

<style scoped lang="scss">
.date-container {
  margin: 0.5rem 0 0 0;
  padding: 0.5rem;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.7);

  opacity: 0.8;

  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;

  svg path {
    fill: rgb(15, 63, 90);
  }
}
</style>
