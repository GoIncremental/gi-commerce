angular.module('gi.commerce').directive 'giCustomerInfo'
, ['giCart'
, (Cart) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.customerInfo.html'
  scope:
    model: '='
    stage: '@'
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart

    $scope.$watch 'stage', (newVal) ->
      if newVal?
        $scope.cart.setStageValidity(newVal, true)

]
