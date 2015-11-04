angular.module('gi.commerce').directive 'giCustomerInfo'
, ['giCart', 'Address'
, (Cart, Address) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.customerInfo.html'
  scope:
    model: '='
    stage: '@'
  link: ($scope, elem, attrs) ->
    $scope.cart = Cart
    $scope.selectedAddress = 0
    
    $scope.selectAddress = (id) ->
      $scope.selectedAddress = id
    
    if $scope.model.me.user?
      Address.query({ userId: $scope.model.me.user._id }).then (addresses) ->
        $scope.cart.addresses = addresses
      
    $scope.billingAddressOptions =
     tabIndex: 3
     showPhone: () ->
       Cart.needsShipping() and (not $scope.cart.differentShipping)
    
    $scope.shippingAddressOptions =
     tabIndex: 4
     showPhone: () ->
       Cart.needsShipping() and $scope.cart.differentShipping

    substagesValid = (stage) ->
      () ->
        stage1 = (not $scope.cart.isStageInvalid(stage + '-1'))
        stage2 = (not $scope.cart.isStageInvalid(stage + '-2'))
        return stage1 and stage2
    
    $scope.$watch 'selectedAddress', (value) ->
      #TODO - add in stage validity
    
    $scope.$watch 'addressForm.$valid', (valid) ->
      $scope.cart.setStageValidity($scope.stage + '-2', valid)

    $scope.$watch substagesValid($scope.stage), (newVal) ->
      $scope.cart.setStageValidity($scope.stage, newVal)

]
