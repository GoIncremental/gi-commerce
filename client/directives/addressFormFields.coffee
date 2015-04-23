angular.module('gi.commerce').directive 'giAddressFormFields'
, ['giCart'
, (Cart) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.addressFormFields.html'
  scope:
    model: '='
    item: '='
    title: '@'
    prefix: '@'
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart
    if not $scope.item?
      $scope.item = {}

]
