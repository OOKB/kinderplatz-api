import { schemaComposer } from 'graphql-compose'
import _ from 'lodash/fp.js'

// import { createSchema } from 'graphql-yoga'

export function getContentIndex(context) {
  const { ASSETS, request } = context
  const url = new URL(request.url)
  url.pathname = '/data/index.json'
  return ASSETS.fetch(url).then((res) => res.json())
}
const HeadingTC = schemaComposer.createObjectTC({
  name: 'Heading',
  fields: {
    id: 'String!',
    depth: 'Int!',
    title: 'String!',
    url: 'String',
  }
})
const FileInfoTC = schemaComposer.createObjectTC({
  name: 'FileInfo',
  fields: {
    ctime: 'String!',
    mtime: 'String!',
    title: 'String!',
    size: 'Int!',
  }
})
const ImageTC = schemaComposer.createObjectTC({
  name: 'Image',
  fields: {
    alt: 'String!',
    src: 'String!',
  },
})
const LinkTC = schemaComposer.createObjectTC({
  name: 'Link',
  fields: {
    name: 'String!',
    href: 'String!',
  },
})

const PageTC = schemaComposer.createObjectTC({
  name: 'Page',
  fields: {
    id: 'ID!',
    collection: 'String',
    content: 'String',
    slug: 'String',
    title: 'String',
    headings: [HeadingTC],
    info: FileInfoTC,
    images: [ImageTC],
    links: [LinkTC],
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
