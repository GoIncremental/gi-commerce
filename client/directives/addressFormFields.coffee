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
    form: '='
    stage: '@'

  link: ($scope, elem, attrs) ->
    $scope.cart = Cart
    if not $scope.item?
      $scope.item = {}

    $scope.isPropertyValidationError = (prop) ->
      $scope.form[prop].$invalid and
      $scope.form[prop].$touched and
      $scope.form[prop].$dirty

    $scope.isPropertyValidationSuccess = (prop) ->
      $scope.form[prop].$valid and
      $scope.form[prop].$touched and
      $scope.form[prop].$dirty

]
