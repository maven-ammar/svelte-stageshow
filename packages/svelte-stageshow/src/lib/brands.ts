/** Local product artwork. No network lookup or runtime icon service. */
export type BrandAsset = {
  name: string
  category: 'Payments' | 'Banks' | 'Apps' | 'Crypto'
  light: string
  dark: string
  tileArtwork?: string
  tileBackground?: string
  proportion: number
  scale: number
}

export const brandMarks = {
  'visa': {
    name: "Visa", category: 'Payments',
    light: new URL('./brands/visa.svg', import.meta.url).href,
    dark: new URL('./brands/visa.svg', import.meta.url).href,
    proportion: 1.56, scale: 0.9,
  },
  'mastercard': {
    name: "Mastercard", category: 'Payments',
    light: new URL('./brands/mastercard.svg', import.meta.url).href,
    dark: new URL('./brands/mastercard.svg', import.meta.url).href,
    proportion: 1.56, scale: 0.9,
  },
  'amex': {
    name: "American Express", category: 'Payments',
    light: new URL('./brands/amex.svg', import.meta.url).href,
    dark: new URL('./brands/amex.svg', import.meta.url).href,
    tileArtwork: new URL('./brands/amex-tile.svg', import.meta.url).href, tileBackground: '#006fcf',
    proportion: 1.56, scale: 0.84,
  },
  'discover': {
    name: "Discover", category: 'Payments',
    light: new URL('./brands/discover.svg', import.meta.url).href,
    dark: new URL('./brands/discover.svg', import.meta.url).href,
    proportion: 1.56, scale: 0.9,
  },
  'paypal': {
    name: "PayPal", category: 'Payments',
    light: new URL('./brands/paypal.svg', import.meta.url).href,
    dark: new URL('./brands/paypal.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'stripe': {
    name: "Stripe", category: 'Payments',
    light: new URL('./brands/stripe.svg', import.meta.url).href,
    dark: new URL('./brands/stripe.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'notion': {
    name: "Notion", category: 'Apps',
    light: new URL('./brands/notion.svg', import.meta.url).href,
    dark: new URL('./brands/notion.svg', import.meta.url).href,
    proportion: 1, scale: 0.68,
  },
  'gmail': {
    name: "Gmail", category: 'Apps',
    light: new URL('./brands/gmail.svg', import.meta.url).href,
    dark: new URL('./brands/gmail.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'google-calendar': {
    name: "Google Calendar", category: 'Apps',
    light: new URL('./brands/google-calendar.svg', import.meta.url).href,
    dark: new URL('./brands/google-calendar.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'google-docs': {
    name: "Google Docs", category: 'Apps',
    light: new URL('./brands/google-docs.svg', import.meta.url).href,
    dark: new URL('./brands/google-docs.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  '1password': {
    name: "1Password", category: 'Apps',
    light: new URL('./brands/1password.svg', import.meta.url).href,
    dark: new URL('./brands/1password-dark.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'figma': {
    name: "Figma", category: 'Apps',
    light: new URL('./brands/figma.svg', import.meta.url).href,
    dark: new URL('./brands/figma.svg', import.meta.url).href,
    proportion: 1, scale: 0.68,
  },
  'slack': {
    name: "Slack", category: 'Apps',
    light: new URL('./brands/slack.svg', import.meta.url).href,
    dark: new URL('./brands/slack.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'github': {
    name: "GitHub", category: 'Apps',
    light: new URL('./brands/github.svg', import.meta.url).href,
    dark: new URL('./brands/github-dark.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'linear': {
    name: "Linear", category: 'Apps',
    light: new URL('./brands/linear.svg', import.meta.url).href,
    dark: new URL('./brands/linear-dark.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'dropbox': {
    name: "Dropbox", category: 'Apps',
    // The source artwork is the glyph on a square blue field; shown as the
    // blue glyph alone, so it sits on a tile like the other app marks
    light: new URL('./brands/dropbox-glyph.svg', import.meta.url).href,
    dark: new URL('./brands/dropbox-glyph.svg', import.meta.url).href,
    proportion: 1, scale: 0.72,
  },
  'google-drive': {
    name: "Google Drive", category: 'Apps',
    light: new URL('./brands/google-drive.svg', import.meta.url).href,
    dark: new URL('./brands/google-drive.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'google-sheets': {
    name: "Google Sheets", category: 'Apps',
    light: new URL('./brands/google-sheets.svg', import.meta.url).href,
    dark: new URL('./brands/google-sheets.svg', import.meta.url).href,
    proportion: 1, scale: 0.74,
  },
  'google-slides': {
    name: "Google Slides", category: 'Apps',
    light: new URL('./brands/google-slides.svg', import.meta.url).href,
    dark: new URL('./brands/google-slides.svg', import.meta.url).href,
    proportion: 1, scale: 0.74,
  },
  'google-meet': {
    name: "Google Meet", category: 'Apps',
    light: new URL('./brands/google-meet.svg', import.meta.url).href,
    dark: new URL('./brands/google-meet.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'zoom': {
    name: "Zoom", category: 'Apps',
    light: new URL('./brands/zoom.svg', import.meta.url).href,
    dark: new URL('./brands/zoom.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'vercel': {
    name: "Vercel", category: 'Apps',
    light: new URL('./brands/vercel.svg', import.meta.url).href,
    dark: new URL('./brands/vercel-dark.svg', import.meta.url).href,
    proportion: 1, scale: 0.64,
  },
  'shopify': {
    name: "Shopify", category: 'Apps',
    light: new URL('./brands/shopify.svg', import.meta.url).href,
    dark: new URL('./brands/shopify.svg', import.meta.url).href,
    proportion: 1, scale: 0.68,
  },
  'bitcoin': {
    name: 'Bitcoin', category: 'Crypto',
    light: new URL('./brands/bitcoin.svg', import.meta.url).href,
    dark: new URL('./brands/bitcoin.svg', import.meta.url).href,
    proportion: 1, scale: 0.68,
  },
  'ethereum': {
    name: 'Ethereum', category: 'Crypto',
    light: new URL('./brands/ethereum.svg', import.meta.url).href,
    dark: new URL('./brands/ethereum.svg', import.meta.url).href,
    proportion: 1, scale: 0.68,
  },
  'solana': {
    name: 'Solana', category: 'Crypto',
    light: new URL('./brands/solana.svg', import.meta.url).href,
    dark: new URL('./brands/solana.svg', import.meta.url).href,
    proportion: 1, scale: 0.68,
  },
  'usdc': {
    name: 'USDC', category: 'Crypto',
    light: new URL('./brands/usdc.svg', import.meta.url).href,
    dark: new URL('./brands/usdc.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
  'tether': {
    name: 'Tether', category: 'Crypto',
    light: new URL('./brands/tether.svg', import.meta.url).href,
    dark: new URL('./brands/tether.svg', import.meta.url).href,
    proportion: 1, scale: 0.68,
  },
  'chase': {
    name: "Chase", category: 'Banks',
    light: new URL('./brands/chase.svg', import.meta.url).href,
    dark: new URL('./brands/chase.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
  'wellsfargo': {
    name: "Wells Fargo", category: 'Banks',
    light: new URL('./brands/wellsfargo.svg', import.meta.url).href,
    dark: new URL('./brands/wellsfargo.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
  'bankofamerica': {
    name: "Bank of America", category: 'Banks',
    light: new URL('./brands/bankofamerica.svg', import.meta.url).href,
    dark: new URL('./brands/bankofamerica-dark.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
  'barclays': {
    name: "Barclays", category: 'Banks',
    light: new URL('./brands/barclays.svg', import.meta.url).href,
    dark: new URL('./brands/barclays.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
  'hsbc': {
    name: "HSBC", category: 'Banks',
    light: new URL('./brands/hsbc.svg', import.meta.url).href,
    dark: new URL('./brands/hsbc.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
  'monzo': {
    name: "Monzo", category: 'Banks',
    light: new URL('./brands/monzo.svg', import.meta.url).href,
    dark: new URL('./brands/monzo-dark.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
  'revolut': {
    name: "Revolut", category: 'Banks',
    light: new URL('./brands/revolut.svg', import.meta.url).href,
    dark: new URL('./brands/revolut-dark.svg', import.meta.url).href,
    proportion: 1, scale: 0.8,
  },
} as const satisfies Record<string, BrandAsset>

export type BrandName = keyof typeof brandMarks

