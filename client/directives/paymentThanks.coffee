angular.module('gi.commerce').directive 'giPaymentThanks'
, [ '$compile', 'giCart'
, ($compile, Cart) ->
  restrict : 'E'
  link: ($scope, elem, attrs) ->
    thanks = angular.element(document.createElement(Cart.thankyouDirective))
    el = $compile(thanks) $scope
    elem.append(el)
    return
]
