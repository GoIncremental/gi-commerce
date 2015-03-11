angular.module('gi.commerce', ['gi.util'])
.value('version', '0.2.0')
.run ['$rootScope', 'giCart','giCartItem', 'giLocalStorage'
, ($rootScope, giCart, giCartItem, store) ->
  $rootScope.$on 'giCart:change', () ->
    giCart.save()

  if angular.isObject(store.get('cart'))
    giCart.restore(store.get('cart'))
  else
    giCart.init()
]
