import { schemaComposer } from 'graphql-compose'
import _ from 'lodash/fp.js'
import { setField, setFieldWith } from 'prairie'
// import { createSchema } from 'graphql-yoga'

function getDataFile(context, fileId, ext = 'json') {
  const { ASSETS, request } = context
  const url = new URL(request.url)
  url.pathname = `/data/${fileId}.${ext}`
  return ASSETS.fetch(url).then((res) => res.json())
}

const getSectionId = _.flow(_.split('/'), _.first)
function addPagesToSections({ data, pages }) {
  const pageIndex = _.keyBy('slug', pages)
  const sectionPages = _.groupBy(
    'sectionId',
    pages.map(setFieldWith('sectionId', 'slug', getSectionId)),
  )

  const pageGet = _.propertyOf(pageIndex)
  const sections = data.find(({ id }) => id === 'sections')
  const { color, menuSize } = sections
  function getPages({ id }) {
    return sectionPages[id] || []
  }
  return sections.sections
    .map(_.flow(
      (x, index) => _.set('menuItem', index < menuSize, x),
      _.defaults({ sectionColor: color }),
      _.update('page', pageGet),
      setFieldWith('id', 'page', _.get('slug')),
      _.update('links', _.flow(_.map(pageGet), _.compact)),
      setField('pages', getPages),
    ))
}

function addSectionToPages(pages, sectionGet) {
  return pages.map(setFieldWith('section', 'slug', sectionGet))
}
function buildIndexes(allData) {
  const sections = addPagesToSections(allData)
  const sectionIndex = _.keyBy('page.slug', sections)
  const sectionGet = _.flow(
    getSectionId,
    _.propertyOf(sectionIndex),
  )
  const pages = addSectionToPages(allData.pages, sectionGet)
  return {
    pages,
    sections,
    sectionIndex,
    sectionGet,
  }
}

export function getContentIndex(context) {
  return getDataFile(context, 'index').then(buildIndexes)
}

const HeadingTC = schemaComposer.createObjectTC({
  name: 'Heading',
  fields: {
    id: 'String!',
    depth: 'Int!',
    title: 'String!',
    url: 'String',
  },
})

const FileInfoTC = schemaComposer.createObjectTC({
  name: 'FileInfo',
  fields: {
    ctime: 'String!',
    mtime: 'String!',
    title: 'String!',
    size: 'Int!',
  },
})
const ImageTC = schemaComposer.createObjectTC({
  name: 'Image',
  fields: {
    alt: 'String',
    src: 'String!',
  },
})

// const LinkTC = schemaComposer.createObjectTC({
//   name: 'Link',
//   fields: {
//     name: 'String!',
//     href: 'String!',
//   },
// })

const PageTC = schemaComposer.createObjectTC({
  name: 'Page',
  fields: {
    id: 'ID!',
    content: 'String',
    slug: 'String',
    title: 'String',
    section: () => SectionTC,
    headings: [HeadingTC],
    info: FileInfoTC,
    images: [ImageTC],
    // links: [LinkTC],
  },
})
const SectionTC = schemaComposer.createObjectTC({
  name: 'Section',
  fields: {
    id: 'ID!',
    page: PageTC,
    links: [PageTC],
    pages: [PageTC],
    sectionColor: 'String',
    images: [ImageTC],
  },
})

async function allPages(x, args, context) {
  const { pages } = await getContentIndex(context)
  return pages
}

async function getPage(x, { id, isSlug }, context) {
  const { pages } = await getContentIndex(context)
  const matcher = isSlug ? { slug: id } : { id }
  const page = pages.find(_.matches(matcher))
  if (!page && isSlug) {
    return pages.find(_.matches({ redirect: id }))
  }
  return page
}
async function getSections(x, { menuItemsOnly }, context) {
  const { sections } = await getContentIndex(context)
  if (menuItemsOnly) return sections.filter(_.matches({ menuItem: true }))
  return sections
}
schemaComposer.Query.addFields({
  blocks: {
    type: '[Block]',
  },
  page: {
    type: 'Page',
    args: { id: 'ID!', isSlug: 'Boolean' },
    resolve: getPage,
  },
  pages: {
    type: '[Page]',
    resolve: allPages,
  },
  // section: {
  //   type: 'Section',
  //   args: { id: 'ID!' },
  //   resolve: section,
  // },
  sections: {
    type: '[Section]',
    args: { menuItemsOnly: 'Boolean' },
    resolve: getSections,
  },
})
const schema = schemaComposer.buildSchema()
export default schema
