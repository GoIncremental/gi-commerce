angular.module('gi.commerce').directive 'giCustomerForm'
, ['$q', 'giCurrency', 'giCart'
, ($q, Currency, Cart) ->
  restrict: 'E'
  scope:
    model: '='
    item: '='
    submitText: '@'
    stage: '@'
  templateUrl: 'gi.commerce.customerForm.html'
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart
    if not $scope.item?
      $scope.item = {}
    $scope.requestLogin = () ->
      $scope.$emit 'event:show-login'

    fieldUsed = (prop) ->
      $scope.customerForm[prop].$dirty and
      $scope.customerForm[prop].$touched

    $scope.isPropertyValidationError = (prop) ->
      fieldUsed(prop) and
      $scope.customerForm[prop].$invalid

    $scope.isPropertyValidationSuccess = (prop) ->
      fieldUsed(prop) and
      $scope.customerForm[prop].$valid

    $scope.isConfirmPasswordSuccess = (prop) ->
      $scope.isPropertyValidationSuccess(prop) and
      $scope.isPropertyValidationSuccess('password')

    $scope.isUsernameTaken = () ->
      fieldUsed('email') and
      (not $scope.customerForm.email.$error.email) and
      $scope.customerForm.email.$error.giUsername

    $scope.isEmailInvalid = () ->
      fieldUsed('email') and
      $scope.customerForm.email.$error.email

    $scope.$watch 'customerForm.$valid', (valid) ->
      $scope.cart.setStageValidity($scope.stage, valid)

]
