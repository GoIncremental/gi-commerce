angular.module('gi.commerce').directive 'giCustomerForm'
, ['$q', 'giCurrency', 'giCart'
, ($q, Currency, Cart) ->
  restrict: 'E'
  scope:
    model: '='
    item: '='
    submitText: '@'
  templateUrl: 'gi.commerce.customerForm.html'
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart
    $scope.requestLogin = () ->
      $scope.$emit 'event:show-login'

    $scope.$watch 'model.me', (me) ->
      if me?.user?
        Cart.setCustomer(me.user)
]
