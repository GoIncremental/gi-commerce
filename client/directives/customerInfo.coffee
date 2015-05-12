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

    substagesValid = (stage) ->
      () ->
        stage1 = (not $scope.cart.isStageInvalid(stage + '-1'))
        return stage1

    $scope.$watch substagesValid($scope.stage), (newVal) ->
      $scope.cart.setStageValidity($scope.stage, newVal)

]
