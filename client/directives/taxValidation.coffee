angular.module('gi.security').directive 'giVat'
, [ '$q', '$parse', '$http', 'giCart'
, ($q, $parse, $http, Cart) ->
  restrict: 'A'
  require: 'ngModel'
  compile: (elem, attrs) ->
    linkFn = ($scope, elem, attrs, controller) ->

      controller.$asyncValidators.giVat = (modelValue, viewValue) ->
        deferred = $q.defer()
        if (not viewValue?) or viewValue is ""
          deferred.resolve()
        else
          Cart.calculateTaxRate(viewValue).then () ->
            if Cart.isTaxExempt()
              deferred.resolve()
            else
              deferred.reject()
          , (error) ->
            deferred.reject()

        deferred.promise

    linkFn
]
