angular.module('gi.commerce').directive 'giCheckout'
, ['giCart', 'usSpinnerService'
, (Cart, Spinner) ->
  restrict : 'E',
  scope:
    model: '='
  templateUrl: 'gi.commerce.checkout.html'
  link: ($scope, element, attrs) ->
    stopSpinner = () ->
      Spinner.stop('gi-cart-spinner-1')
      Cart.setValidity true

    wrapSpinner =  (promise) ->
      Cart.setValidity false
      Spinner.spin('gi-cart-spinner-1')
      promise.then stopSpinner, stopSpinner

    $scope.cart = Cart
    $scope.$watch 'cart.getStage()', (newVal) ->
      if newVal?
        if newVal is 3
          wrapSpinner $scope.cart.calculateTaxRate()

    $scope.$watch 'model.me', (me) ->
      if me?.user?
        Cart.setCustomer(me.user)

    $scope.$watch 'model.userCountry', (newVal) ->
      if newVal?
        wrapSpinner Cart.setCountry(newVal.code)

]
