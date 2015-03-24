angular.module('gi.commerce').directive 'giPaymentInfo'
, ['giCart'
, (Cart) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.paymentInfo.html'
  scope:
    model: '='
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart

    $scope.getCreditFont = () ->
      switch $scope.cardForm.cardNumber.$giCcEagerType
        when "Visa" then "fa-cc-visa"
        when "MasterCard" then "fa-cc-mastercard"
        else "fa-credit-card"

    $scope.getCvcFont = () ->
      if $scope.cardForm.cardSecurity.$touched
        if $scope.cardForm.cardSecurity.$invalid
          "fa-exclamation-circle"
        else
          "fa-check-circle"
      else
        ""
    $scope.isNumberValidationError = () ->
      $scope.cardForm.cardNumber.$invalid and
      $scope.cardForm.cardNumber.$touched and
      $scope.cardForm.cardNumber.$dirty

    $scope.isNumberValidationSuccess = () ->
      $scope.cardForm.cardNumber.$valid and
      $scope.cardForm.cardNumber.$touched and
      $scope.cardForm.cardNumber.$dirty

    $scope.isSecurityValidationError = () ->
      $scope.cardForm.cardSecurity.$invalid and
      $scope.cardForm.cardSecurity.$touched and
      $scope.cardForm.cardSecurity.$dirty

    $scope.isSecurityValidationSuccess = () ->
      $scope.cardForm.cardSecurity.$valid and
      $scope.cardForm.cardSecurity.$touched and
      $scope.cardForm.cardSecurity.$dirty

    $scope.isPayNowEnabled = () ->
      $scope.cardForm.$valid
]
