'use client'

import React from 'react'

import styles from './BlogSide.module.scss'

import Link from 'next/link'
import { Url } from 'next/dist/shared/lib/router/router'

import dynamic from 'next/dynamic'

// icons
const ArrowPathIcon = dynamic(
  () => import('@heroicons/react/24/outline').then((mod) => mod.ArrowPathIcon),
  { ssr: false }
)

const CalendarDaysIcon = dynamic(
  () =>
    import('@heroicons/react/24/outline').then((mod) => mod.CalendarDaysIcon),
  {
    ssr: false
  }
)

// relmethis
const InlineText = dynamic(
  () => import('relmethis').then((mod) => mod.InlineText),
  { ssr: false }
)

const Image = dynamic(() => import('relmethis').then((mod) => mod.Image), {
  ssr: false,
  loading: () => <></>
})

const BlogSideCard = ({
  href,
  image,
  title,
  description,
  createdAt,
  updatedAt
}: {
  href: Url
  image: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}) => {
  return (
    <Link href={href} className={styles['side-card']}>
      <Image src={image} alt='' />
      <div className={styles['side-card__typography']}>
        <div>
          <InlineText fontSize={'1.1rem'}>{title}</InlineText>
        </div>
        <div>
          <InlineText fontSize={'0.8rem'} opacity={0.6}>
            {description}
          </InlineText>
        </div>
        <div className={styles['side-card__date']}>
          <CalendarDaysIcon className={styles['side-card__icon']} />
          <InlineText fontSize={'0.8rem'} opacity={0.6}>
            {createdAt}
          </InlineText>
          <ArrowPathIcon className={styles['side-card__icon']} />
          <InlineText fontSize={'0.8rem'} opacity={0.7}>
            {updatedAt}
          </InlineText>
        </div>
      </div>
    </Link>
  )
}

const seed = [
  {
    href: `/blog/article/1`,
    image: '/no',
    title: '群論で解決するパスファインディング',
    description:
      'パスファインディング問題に群論を応用した新しいアプローチを解説します。迷路やグラフ探索で最適な経路を求める際に、群論の対称性や構造をどのように活かせるのかを具体的に紹介。従来のアルゴリズムとは異なる視点で、効率的かつ数学的に美しい解決策を探求します。数学やアルゴリズムの最適化に興味がある方にとって、刺激的な内容です。',
    createdAt: '2000-01-01',
    updatedAt: '2000-01-01'
  },
  {
    href: `/blog/article/2`,
    image: '/no',
    title: 'トポロジーとネットワークデザイン',
    description:
      'トポロジーの概念を利用してネットワークデザインの最適化について考察します。トポロジーを活用することで、冗長性や耐障害性を持たせた設計手法を紹介。数学的な視点からインフラやクラウドアーキテクチャに応用できる理論を解説し、現代のシステム設計にどのように役立てられるかを考察します。',
    createdAt: '2022-05-12',
    updatedAt: '2022-06-14'
  },
  {
    href: `/blog/article/3`,
    image: '/no',
    title: '計算複雑性理論で解く暗号問題',
    description:
      '計算複雑性理論の視点から、現代の暗号技術がどのようにして強固なセキュリティを実現しているのかを詳しく説明します。NP完全問題や一方向性関数の概念を活用して、安全な暗号の設計に必要な基本的な考え方を紹介。コンピュータセキュリティに関心がある方に最適な内容です。',
    createdAt: '2023-02-20',
    updatedAt: '2023-02-21'
  }
]

export const BlogSide = () => {
  return (
    <nav className={styles.side}>
      {seed.map((data) => (
        <BlogSideCard
          key={data.href}
          href={data.href}
          image={data.image}
          title={data.title}
          description={data.description}
          createdAt={data.createdAt}
          updatedAt={data.updatedAt}
        />
      ))}
    </nav>
  )
}
