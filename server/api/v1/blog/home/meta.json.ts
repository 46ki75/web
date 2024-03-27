export default defineEventHandler(async (event) => {
  return {
    slug: 'home',
    title: 'Blog Home',
    description: 'This is the top of Blog pages.',
    tags: [],
    status: { name: 'public', color: 'default' },
    createdAt: '2022-10-01',
    updatedAt: new Date().toISOString()
  }
})
