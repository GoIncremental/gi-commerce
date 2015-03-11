angular.module('gi.commerce').factory 'giCountry'
, ['giCrud'
, (Crud) ->
  Crud.factory 'country'
]
