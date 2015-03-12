angular.module('gi.commerce').factory 'giPriceList'
, ['giCrud'
, (Crud) ->
  Crud.factory 'priceList'
]
