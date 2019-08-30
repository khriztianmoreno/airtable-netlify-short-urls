import dotenv from 'dotenv'

dotenv.config()

const messages = require('./messages')
const shorten = require('./shorten')

module.exports = {
  shorten,
  messages,
}
