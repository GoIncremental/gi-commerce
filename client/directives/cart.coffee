angular.module('gi.commerce').directive 'giCart'
, ['giCart'
, (giCart) ->
  restrict : 'E',
  scope: {}
  templateUrl: 'gi.commerce.cart.html'
  link: ($scope, element, attrs) ->
    $scope.giCart = giCart
]
