priceLists = require './priceLists'
currencies = require './currencies'
countries = require './countries'

module.exports = (dal, options) ->
  priceLists: priceLists dal
  currencies: currencies dal
  countries:  countries dal
