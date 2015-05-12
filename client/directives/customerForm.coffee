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
    $scope.requestLogin = () ->
      $scope.$emit 'event:show-login'

    $scope.$watch 'model.me', (me) ->
      if me?.user?
        Cart.setCustomer(me.user)

    $scope.isPropertyValidationError = (prop) ->
      $scope.customerForm[prop].$invalid and
      $scope.customerForm[prop].$touched and
      $scope.customerForm[prop].$dirty

    $scope.isPropertyValidationSuccess = (prop) ->
      $scope.customerForm[prop].$valid and
      $scope.customerForm[prop].$touched and
      $scope.customerForm[prop].$dirty

    $scope.isConfirmPasswordSuccess = (prop) ->
      $scope.isPropertyValidationSuccess(prop) and
      $scope.isPropertyValidationSuccess('password')

    $scope.$watch 'customerForm.$valid', (valid) ->
      $scope.cart.setStageValidity($scope.stage, valid)

]
