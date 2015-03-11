angular.module('gi.commerce').directive 'giAddToCart'
, ['giCart'
, (giCart) ->
  restrict : 'E'
  scope:
    id: '@'
    name: '@'
    quantity: '@'
    price: '@'
    data: '='
  transclude: true
  templateUrl: 'gi.commerce.addtocart.html'
  link: (scope, element, attrs) ->
    scope.attrs = attrs
    
    scope.addItem = (item) ->
      giCart.addItem(item)

    scope.inCart = () ->
      giCart.getItemById(attrs.id)
]
