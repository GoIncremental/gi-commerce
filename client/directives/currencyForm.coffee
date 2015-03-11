angular.module('gi.commerce').directive 'giCurrencyForm'
, ['$q', 'giCurrency'
, ($q, Currency) ->
  restrict: 'E'
  scope:
    item: '='
    submitText: '@'
  templateUrl: 'gi.commerce.currencyForm.html'
  link:
    pre: ($scope) ->
      $scope.save = () ->
        Currency.save($scope.item).then () ->
          alert =
            name: 'cohort-saved'
            type: 'success'
            msg: "Currency Saved."

          $scope.$emit 'event:show-alert', alert
          $scope.$emit 'cohort-saved', $scope.item
          $scope.clear()
        , (err) ->
          alert =
            name: 'currency-not-saved'
            type: 'danger'
            msg: "Failed to save currency. " + err.data.error
          $scope.$emit 'event:show-alert',alert

      $scope.clear = () ->
        $scope.item = {}
        $scope.cohortForm.$setPristine()
        $scope.confirm = false
        $scope.$emit 'currency-form-cleared'

      $scope.destroy = () ->
        if $scope.confirm
          Currency.destroy($scope.item._id).then () ->
            alert =
              name: 'currency-deleted'
              type: 'success'
              msg: 'Currency Deleted.'
            $scope.$emit 'event:show-alert', alert
            $scope.$emit 'currency-deleted'
            $scope.clear()
          , () ->
            alert =
              name: "Currency not deleted"
              msg: "Currency not deleted."
              type: "warning"
            $scope.$emit 'event:show-alert', alert
            $scope.confirm = false
        else
          $scope.confirm = true
]
