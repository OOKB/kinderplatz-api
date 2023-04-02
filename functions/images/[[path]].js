const IMG_URL = 'https://img.rogersandgoffigon.com'
const ACCOUNT = 'kinderplatz'

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
  const requestUrl = new URL(request.url)
  // return new Response("Color sorting information");
  const path = requestUrl.pathname
  const variation = requestUrl.searchParams.has('variation') ? requestUrl.searchParams.get('variation') : 'w450'
  const url = `${IMG_URL}/b2/path/${variation}/${ACCOUNT}${path}`
  return fetch(url, request)
  // return new Response(url)
}
