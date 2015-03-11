gi = require 'gi-util'
conFac = gi.common.crudControllerFactory
module.exports = (app) ->
  priceList:    conFac app.models.priceLists
  currency:     conFac app.models.currencies
  country:      conFac app.models.countries
