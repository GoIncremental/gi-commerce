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
        stage2 = (not $scope.cart.isStageInvalid(stage + '-2'))
        return stage1 and stage2

    $scope.$watch 'addressForm.$valid', (valid) ->
      $scope.cart.setStageValidity($scope.stage + '-2', valid)

    $scope.$watch substagesValid($scope.stage), (newVal) ->
      $scope.cart.setStageValidity($scope.stage, newVal)

]
