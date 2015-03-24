angular.module('gi.commerce').directive 'giCustomerInfo'
, ['giCart'
, (Cart) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.customerInfo.html'
  scope:
    model: '='
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart

]
