import { factory } from '@/Factory'
import { NextResponse } from 'next/server'

export const GET = async (): Promise<NextResponse> => {
  const notion = await factory.getNotionClient()
  const { properties } = await notion.databases.retrieve(
    await factory.getBlogDBID()
  )

  if (
    'multi_select' in properties.tags &&
    'options' in properties.tags.multi_select
  ) {
    return NextResponse.json(properties.tags.multi_select.options)
  } else {
    throw new Error('Fetch failed.')
  }
}
