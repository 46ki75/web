import { factory } from '../../../helpers/Factory'

export default defineEventHandler(async (event) => {
  const notion = await factory.getNotionClient()
  const { properties } = await notion.databases.retrieve(
    await factory.getBlogDBID()
  )

  if (
    'multi_select' in properties.tags &&
    'options' in properties.tags.multi_select
  ) {
    return properties.tags.multi_select.options
  } else {
    throw new Error('Fetch failed.')
  }
})
