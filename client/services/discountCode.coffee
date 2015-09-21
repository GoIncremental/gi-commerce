angular.module('gi.commerce').factory 'giDiscountCode'
, ['giCrud'
, (Crud) ->
  Crud.factory 'discountCode'
]
