// One place that decides the site's origin.
//
// Everything absolute — canonical links, og:url, the sitemap, llms.txt — is built
// from this. When stageshow.is-a.dev lands, set SITE_ORIGIN and rebuild; no file
// in the project hardcodes the domain anywhere else.
export const DEFAULT_ORIGIN = 'https://svelte-stageshow.vercel.app'

export const SITE_ORIGIN = (process.env.SITE_ORIGIN || DEFAULT_ORIGIN).replace(/\/+$/, '')
