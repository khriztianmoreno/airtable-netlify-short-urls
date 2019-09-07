import dotenv from 'dotenv'

dotenv.config()

const shorten = require('../utils/shorten')
const {LINK_NOT_PROVIDED} = require('../utils/messages')

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {statusCode: 405, body: 'Method Not Allowed'}
  }

  // When the method is POST, the name will no longer be in the event’s
  // queryStringParameters – it’ll be in the event body encoded as a query string
  const params = JSON.parse(event.body)
  const code = params.code
  const longLink = params.url

  if (!longLink) {
    console.log(LINK_NOT_PROVIDED)
    return {
      statusCode: 400,
      body: JSON.stringify({err: LINK_NOT_PROVIDED}),
    }
  }

  try {
    const shortUrl = await shorten(longLink, code)
    return {
      statusCode: 200,
      headers: {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({shortUrl}),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({err: error}),
    }
  }
}
