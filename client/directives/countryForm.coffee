angular.module('gi.commerce').directive 'giCountryForm'
, ['$q', 'giCurrency', 'giCountry'
, ($q, Currency, Country) ->
  restrict: 'E'
  scope:
    submitText: '@'
    model: '='
  templateUrl: 'gi.commerce.countryForm.html'
  link:
    pre: ($scope) ->
      $scope.save = () ->
        $scope.model.selectedItem.acl = "public-read"
        Country.save($scope.model.selectedItem).then () ->
          alert =
            name: 'country-saved'
            type: 'success'
            msg: "Country Saved."

          $scope.$emit 'event:show-alert', alert
          $scope.$emit 'country-saved', $scope.model.selectedItem
          $scope.clear()
        , (err) ->
          alert =
            name: 'country-not-saved'
            type: 'danger'
            msg: "Failed to save Country. " + err.data.error
          $scope.$emit 'event:show-alert',alert

      $scope.clear = () ->
        $scope.model.selectedItem = {}
        $scope.countryForm.$setPristine()
        $scope.confirm = false
        $scope.$emit 'country-form-cleared'

      $scope.destroy = () ->
        if $scope.confirm
          Country.destroy($scope.model.selectedItem._id).then () ->
            alert =
              name: 'country-deleted'
              type: 'success'
              msg: 'Country Deleted.'
            $scope.$emit 'event:show-alert', alert
            $scope.$emit 'country-deleted'
            $scope.clear()
          , () ->
            alert =
              name: "Country not deleted"
              msg: "Country not deleted."
              type: "warning"
            $scope.$emit 'event:show-alert', alert
            $scope.confirm = false
        else
          $scope.confirm = true
]
