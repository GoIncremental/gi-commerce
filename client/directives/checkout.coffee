angular.module('gi.commerce').directive 'giCheckout'
, ['giCart', 'usSpinnerService', 'Address'
, (Cart, Spinner, Address) ->
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

    if $scope.cart.getItems().length == 0
      $scope.cart.setStage(1)

    $scope.$watch 'cart.getStage()', (newVal) ->
      if newVal?
        if newVal is 3
          wrapSpinner $scope.cart.calculateTaxRate()


    $scope.$watch 'model.me', (me) ->
      if me?.user?
        Cart.setCustomer(me.user)
        Address.query({ userId: $scope.model.me.user._id }).then (addresses) ->
          $scope.cart.addresses = addresses

    $scope.$watch 'model.userCountry', (newVal) ->
      if newVal?
        wrapSpinner Cart.setCountry(newVal.code)

    $scope.payNow = () ->
      $scope.inPayment = true
      wrapSpinner(Cart.payNow()).then () ->
        $scope.inPayment = false
      , () ->
        $scope.inPayment = false

]
