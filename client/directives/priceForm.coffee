angular.module('gi.commerce').directive 'giPriceForm'
, ['$q', 'giPriceList'
, ($q, PriceList) ->
  restrict: 'E'
  scope:
    submitText: '@'
    model: '='
  templateUrl: 'gi.commerce.priceForm.html'
  link:
    pre: ($scope) ->
      $scope.local = {}
      $scope.savePriceForMarket = (code) ->
        if $scope.model.selectedItem?
          if not $scope.model.selectedItem.prices?
            $scope.model.selectedItem.prices = {}
          $scope.model.selectedItem.prices[code] = $scope.local.price
          $scope.local = {}

      $scope.removePriceForMarket = (code) ->
        if $scope.model.selectedItem?.prices?
          delete $scope.model.selectedItem.prices[code]

      $scope.save = () ->
        $scope.model.selectedItem.acl = "public-read"
        PriceList.save($scope.model.selectedItem).then () ->
          alert =
            name: 'price-saved'
            type: 'success'
            msg: "Price Saved."

          $scope.$emit 'event:show-alert', alert
          $scope.$emit 'price-saved', $scope.model.selectedItem
          $scope.clear()
        , (err) ->
          alert =
            name: 'price-not-saved'
            type: 'danger'
            msg: "Failed to save price. " + err.data.error
          $scope.$emit 'event:show-alert',alert

      $scope.clear = () ->
        $scope.model.selectedItem = {}
        $scope.priceForm.$setPristine()
        $scope.confirm = false
        $scope.$emit 'price-form-cleared'

      $scope.destroy = () ->
        if $scope.confirm
          PriceList.destroy($scope.model.selectedItem._id).then () ->
            alert =
              name: 'price-deleted'
              type: 'success'
              msg: 'price Deleted.'
            $scope.$emit 'event:show-alert', alert
            $scope.$emit 'price-deleted'
            $scope.clear()
          , () ->
            alert =
              name: "Price not deleted"
              msg: "Price not deleted."
              type: "warning"
            $scope.$emit 'event:show-alert', alert
            $scope.confirm = false
        else
          $scope.confirm = true
]
