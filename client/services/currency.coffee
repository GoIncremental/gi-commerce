angular.module('gi.commerce').factory 'giCurrency'
, ['$filter', 'giCrud', 'giCountry'
, ($filter, Crud, Country) ->
  Crud.factory 'currency'
]
