gi = require 'gi-util'
conFac = gi.common.crudControllerFactory
quaderno = require './quaderno'

module.exports = (app) ->
  priceList:    conFac app.models.priceLists
  currency:     conFac app.models.currencies
  country:      conFac app.models.countries
  market:    conFac app.models.markets
  quaderno: quaderno()
