angular.module('gi.commerce').directive 'giAddressFormFields'
, ['giCart', 'giI18n', 'giUtil'
, (Cart, I18n, Util) ->
  restrict : 'E'
  templateUrl: 'gi.commerce.addressFormFields.html'
  scope:
    model: '='
    item: '='
    title: '@'
    prefix: '@'
    form: '='
    stage: '@'
    options: '='
    addresses: '='
    selectaddress: '='
    deleteAddress: '='

  link: ($scope, elem, attrs) ->
    $scope.cart = Cart

    Cart.sendCart('Viewed Address Details')

    $scope.getStateMessage = () ->
      I18n.getCapitalisedMessage('gi-postal-area')

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

    $scope.getCountrySorter = () ->
      topCodes = []
      if $scope.cart.getCountryCode()
        topCodes.push $scope.cart.getCountryCode()

      if not ("US" in topCodes)
        topCodes.push "US"

      if not ("GB" in topCodes)
        topCodes.push "GB"

      Util.countrySort(topCodes)
    
    $scope.updateAddress = (selectedAddress) ->
      $scope.item = selectedAddress
    
]
