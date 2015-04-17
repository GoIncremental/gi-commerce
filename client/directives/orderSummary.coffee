angular.module('gi.commerce').directive 'giOrderSummary'
, ['giCart'
, (Cart) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.orderSummary.html'
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart
]
