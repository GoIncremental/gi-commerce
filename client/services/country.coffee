angular.module('gi.commerce').factory 'giCountry'
, ['$filter', 'giCrud'
, ($filter, Crud) ->
  crud = Crud.factory 'country'

  getFromCode = (code) ->
    crud.all().then (countries) ->
      countryCode = code.toUpperCase()
      temp = $filter('filter') countries, (country) ->
        country.code is countryCode
      if temp.length > 0
        temp[0]
      else
        getDefault()

  getDefault = () ->
    crud.all().then (countries) ->
      result = null
      temp = $filter('filter') countries, (country) ->
        country.default
      if temp.length > 0
        result = temp[0]
      result

  crud.getDefault = getDefault
  crud.getFromCode = getFromCode
  crud
]
