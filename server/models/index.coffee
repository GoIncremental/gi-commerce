priceLists = require './priceLists'
currencies = require './currencies'
countries = require './countries'
territories = require './territories'

module.exports = (dal, options) ->
  priceLists: priceLists dal
  currencies: currencies dal
  countries:  countries dal
  territories: territories dal
