angular.module('gi.commerce').directive 'giMarketForm'
, ['$q', 'giCrud', 'giMarket'
, ($q, Crud, Model) ->
  Crud.formDirectiveFactory('Market', Model)
]
