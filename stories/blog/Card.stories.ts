import type { Meta, StoryObj } from '@storybook/vue3'

import BlogCard from '../../components/blog/Card.vue'

const meta: Meta<typeof BlogCard> = {
  component: BlogCard,
  title: 'Blog/BlogCard',
  tags: ['autodocs'],
  argTypes: {}
}

export default meta
type Story = StoryObj<typeof BlogCard>

export const Primary: Story = {
  args: {
    title: 'React入門: 基本から応用まで',
    description:
      'このブログ記事では、Reactの基本的なコンポーネントの作成方法から、コンポーネントベースのアーキテクチャ、仮想DOM、JSXなどの核心概念までを解説します。初心者から中級者までがReactを学び、高品質なWebアプリケーションの開発に役立てるためのガイドです。',
    image: '/images/ogp.webp',
    tags: [
      {
        name: 'React',
        color: 'blue'
      },
      {
        name: 'Vue',
        color: 'green'
      },
      {
        name: 'Svelte',
        color: 'orange'
      }
    ]
  }
}
