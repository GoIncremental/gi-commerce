angular.module('gi.commerce').directive 'giCheckout'
, ['giCart'
, (Cart) ->
  restrict : 'E',
  scope:
    model: '='
  templateUrl: 'gi.commerce.checkout.html'
  link: ($scope, element, attrs) ->
    $scope.cart = Cart
    $scope.$watch 'cart.getStage()', (newVal) ->
      if newVal?
        if newVal is 3
          $scope.cart.calculateTaxRate()

    $scope.$watch 'model.me', (me) ->
      if me?.user?
        Cart.setCustomer(me.user)

]
