angular.module('gi.commerce').directive 'giCustomerForm'
, ['$q', 'giCurrency'
, ($q, Currency) ->
  restrict: 'E'
  scope:
    model: '='
    item: '='
    submitText: '@'
  templateUrl: 'gi.commerce.customerForm.html'
  link: ($scope, elem, attrs) ->
    $scope.requestLogin = () ->
      $scope.$emit 'event:show-login'
]
