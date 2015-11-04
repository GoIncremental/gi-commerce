priceLists = require './priceLists'
currencies = require './currencies'
countries = require './countries'
markets = require './markets'
discountCodes = require './discountCodes'
addresses = require './addresses'

module.exports = (dal, options) ->
  priceLists: priceLists dal
  currencies: currencies dal
  countries:  countries dal
  markets: markets dal
  discountCodes: discountCodes dal
  addresses: addresses dal
