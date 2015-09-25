angular.module('gi.commerce').directive 'giDiscountForm'
, ['giDiscountCode', 'giCart', (giDiscountCode, giCart) ->
  restrict: 'E'
  templateUrl: 'gi.commerce.discountForm.html'
  link: ($scope, elem, attrs) ->


    $scope.checkCode = (code) ->
      giCart.checkCode(code).then( (percent)->
        if percent > 0
          $scope.codePercent = percent
          alert =
            name: 'code-redeemed'
            type: 'success'
            msg: code + ' redeemed successfuly'
          $scope.$emit 'event:show-alert',alert
        else
          alert =
            name: 'code-invalid'
            type: 'danger'
            msg: 'You have entered an invalid code.'
          $scope.$emit 'event:show-alert',alert
      , (err) ->
        alert =
          name: 'code-error'
          type: 'danger'
          msg: err
        $scope.$emit 'event:show-alert',alert
      )




]
