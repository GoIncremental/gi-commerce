angular.module('gi.commerce').directive 'giCart'
, ['giCart'
, (giCart) ->
  restrict : 'E',
  scope:
    stage: '@'
  templateUrl: 'gi.commerce.cart.html'
  link: ($scope, element, attrs) ->
    $scope.giCart = giCart

    $scope.$watch 'giCart.totalItems()', (numItems) ->
      valid = numItems > 0
      $scope.giCart.setStageValidity($scope.stage, valid)
]
