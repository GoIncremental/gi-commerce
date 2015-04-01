priceLists = require './priceLists'
currencies = require './currencies'
countries = require './countries'
markets = require './markets'

module.exports = (dal, options) ->
  priceLists: priceLists dal
  currencies: currencies dal
  countries:  countries dal
  markets: markets dal
