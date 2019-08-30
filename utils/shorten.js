const {URL} = require('url')
const Airtable = require('airtable')

// dotenv.config({path: path.join(__dirname, '../.env')})

const apiKey = getEnv('AIRTABLE_KEY')
const base = getEnv('AIRTABLE_BASE')
const table = getEnv('AIRTABLE_TABLE', 'URLs')
const urlBase = getEnv('URL_BASE')
const shortCodeField = getEnv('AIRTABLE_SHORT_CODE_FIELD', 'Short Code')
const longLinkField = getEnv('AIRTABLE_LONG_LINK_FIELD', 'Long Link')
const airtable = new Airtable({apiKey})

const {
  LINK_NOT_PROVIDED,
  INVALID_URL,
  LINK_ALREADY_EXISTS,
} = require('../utils/messages')

/**
 * Shorten url
 * @param {*} longLink
 * @param {*} code
 */
async function shorten(longLink, code) {
  code = code || generateCode()
  if (!longLink) {
    console.log(LINK_NOT_PROVIDED)
    return
  }
  try {
    // validate URL
    new URL(longLink)
  } catch (error) {
    console.log(`${longLink} ${INVALID_URL}`)

    return `${longLink} ${INVALID_URL}`
  }
  console.log(`Attempting to set redirect "${code}" -> ${longLink}`)

  try {
    const existingRecords = await getExistingRecord(code)
    if (existingRecords && existingRecords[0]) {
      const existingLink = existingRecords[0].get(longLinkField)
      const msg = `${LINK_ALREADY_EXISTS} ${existingLink}`
      console.log(msg)

      return msg
    }
    const createdRecord = await saveShortUrl(longLink, code)

    return await `${urlBase}${createdRecord.fields[shortCodeField]}`
  } catch (error) {
    return error
  }
}

function getExistingRecord(code) {
  return airtable
    .base(base)(table)
    .select({
      maxRecords: 1,
      fields: [longLinkField],
      filterByFormula: `{${shortCodeField}} = "${code}"`,
    })
    .firstPage()
}

function saveShortUrl(longLink, code) {
  return airtable
    .base(base)(table)
    .create({
      [shortCodeField]: code,
      [longLinkField]: longLink,
    })
}

function generateCode() {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

function getEnv(name, defaultValue) {
  return process.env[name] || defaultValue
}

module.exports = shorten
