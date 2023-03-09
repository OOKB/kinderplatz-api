import { createYoga } from 'graphql-yoga'
import schema from '../graphql/schema.js'

// What endpoint path does this respond to?
const PATH = '/graphql' // env.GRAPHQL_ROUTE

const yoga = createYoga({
  graphqlEndpoint: PATH,
  landingPage: false,
  schema,
})

// Handle requests for sorting information.
// eslint-disable-next-line import/prefer-default-export
export async function onRequest(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    // waitUntil, // same as ctx.waitUntil in existing Worker API
    // next, // used for middleware or to fetch assets
    // data, // arbitrary space for passing data between middlewares
  } = context

  // return new Response("Color sorting information");
  return yoga.fetch(request, env, params)
}
