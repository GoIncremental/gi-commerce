angular.module('gi.commerce').directive 'giAddressFormFields'
, ['giCart', 'giI18n'
, (Cart, I18n) ->
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

  link: ($scope, elem, attrs) ->
    $scope.cart = Cart

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

]
