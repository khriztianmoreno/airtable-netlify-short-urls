"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('url'),
    URL = _require.URL;

var Airtable = require('airtable'); // dotenv.config({path: path.join(__dirname, '../.env')})


var apiKey = getEnv('AIRTABLE_KEY');
var base = getEnv('AIRTABLE_BASE');
var table = getEnv('AIRTABLE_TABLE', 'URLs');
var urlBase = getEnv('URL_BASE');
var shortCodeField = getEnv('AIRTABLE_SHORT_CODE_FIELD', 'Short Code');
var longLinkField = getEnv('AIRTABLE_LONG_LINK_FIELD', 'Long Link');
var airtable = new Airtable({
  apiKey: apiKey
});

var _require2 = require('./messages'),
    LINK_NOT_PROVIDED = _require2.LINK_NOT_PROVIDED,
    INVALID_URL = _require2.INVALID_URL,
    LINK_ALREADY_EXISTS = _require2.LINK_ALREADY_EXISTS;
/**
 * Shorten url
 * @param {*} longLink
 * @param {*} code
 */


async function shorten(longLink, code) {
  code = code || generateCode();

  if (!longLink) {
    console.log(LINK_NOT_PROVIDED);
    return;
  }

  try {
    // validate URL
    new URL(longLink);
  } catch (error) {
    console.log("".concat(longLink, " ").concat(INVALID_URL));
    return "".concat(longLink, " ").concat(INVALID_URL);
  }

  console.log("Attempting to set redirect \"".concat(code, "\" -> ").concat(longLink));

  try {
    var existingRecords = await getExistingRecord(code);

    if (existingRecords && existingRecords[0]) {
      var existingLink = existingRecords[0].get(longLinkField);
      var msg = "".concat(LINK_ALREADY_EXISTS, " ").concat(existingLink);
      console.log(msg);
      return msg;
    }

    var createdRecord = await saveShortUrl(longLink, code);
    return await "".concat(urlBase).concat(createdRecord.fields[shortCodeField]);
  } catch (error) {
    return error;
  }
}

function getExistingRecord(code) {
  return airtable.base(base)(table).select({
    maxRecords: 1,
    fields: [longLinkField],
    filterByFormula: "{".concat(shortCodeField, "} = \"").concat(code, "\"")
  }).firstPage();
}

function saveShortUrl(longLink, code) {
  var _airtable$base$create;

  return airtable.base(base)(table).create((_airtable$base$create = {}, _defineProperty(_airtable$base$create, shortCodeField, code), _defineProperty(_airtable$base$create, longLinkField, longLink), _airtable$base$create));
}

function generateCode() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function getEnv(name, defaultValue) {
  return process.env[name] || defaultValue;
}

module.exports = shorten;
