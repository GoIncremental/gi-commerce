angular.module('gi.commerce').factory 'giCurrency'
, ['$filter', 'giCrud', 'giCountry'
, ($filter, Crud, Country) ->

  crud = Crud.factory 'currency'

  getFromCountryCode = (code) ->
    Country.all().then (countries) ->
      countryCode = code.toUpperCase()
      result = null
      temp = $filter('filter') countries, (country) ->
        country.code is countryCode
      if temp.length > 0
        cur = crud.getCached(temp[0].currencyId)
        if cur?
          result = cur
      result

  crud.getFromCountryCode = getFromCountryCode
  crud
]
