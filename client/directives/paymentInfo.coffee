angular.module('gi.commerce').directive 'giPaymentInfo'
, ['$window', 'giCart'
, ($window, Cart) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.paymentInfo.html'
  scope:
    model: '='
    stage: '@'
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart

    Cart.sendCart('Viewed Card Details')

    $scope.getCreditFont = () ->
      switch $scope.cardForm.cardNumber.$giCcEagerType
        when "Visa" then "fa-cc-visa"
        when "MasterCard" then "fa-cc-mastercard"
        else "fa-credit-card"

    $scope.getPropertyFont = (prop) ->
      if $scope.cardForm[prop].$touched
        if $scope.cardForm[prop].$invalid
          "fa-exclamation-circle"
        else
          "fa-check-circle"
      else
          ""

    $scope.isPropertyValidationError = (prop) ->
      $scope.cardForm[prop].$invalid and
      $scope.cardForm[prop].$touched and
      $scope.cardForm[prop].$dirty

    $scope.isPropertyValidationSuccess = (prop) ->
      $scope.cardForm[prop].$valid and
      $scope.cardForm[prop].$touched and
      $scope.cardForm[prop].$dirty

    $scope.isPayNowEnabled = () ->
      $scope.cardForm.$valid

    $scope.$watch 'cardForm.$valid', (valid) ->
      $scope.cart.setStageValidity($scope.stage, valid)

    scrollToTop = () ->
      $window.scrollTo(0,0)

    scrollToTop()

]
