import type { Meta, StoryObj } from '@storybook/vue3'

import BlogTag from '../../components/blog/Tag.vue'

const meta: Meta<typeof BlogTag> = {
  component: BlogTag,
  title: 'Blog/BlogTag',
  tags: ['autodocs'],
  argTypes: {}
}

export default meta
type Story = StoryObj<typeof BlogTag>

export const Primary: Story = {
  args: {
    label: 'React',
    href: '/'
  }
}
