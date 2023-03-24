import { schemaComposer } from 'graphql-compose'
import _ from 'lodash/fp.js'

// import { createSchema } from 'graphql-yoga'

export function getContentIndex(context) {
  const { ASSETS, request } = context
  const url = new URL(request.url)
  url.pathname = '/data/index.json'
  return ASSETS.fetch(url).then((res) => res.json())
}

const PageTC = schemaComposer.createObjectTC({
  name: 'Page',
  fields: {
    id: 'ID!',
    content: 'String',
    slug: 'String',
    title: 'String',
  }
})

async function pages(x, args, context) {
  const { pages } = await getContentIndex(context)
  return pages
}
async function page(x, { id, isSlug }, context) {
  const allPages = await pages(x, null, context)
  const matcher = isSlug ? { slug: id } : { id }
  return allPages.find(_.matches(matcher))
}
schemaComposer.Query.addFields({
  pages: {
    type: '[Page]',
    resolve: pages,
  },
  page: {
    type: 'Page',
    args: { id: 'ID!', isSlug: 'Boolean' },
    resolve: page,
  },
})
const schema = schemaComposer.buildSchema()
export default schema
