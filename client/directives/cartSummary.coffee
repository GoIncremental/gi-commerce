angular.module('gi.commerce').directive 'giCartSummary'
, ['giCart'
, (giCart) ->
  restrict : 'E'
  scope: {}
  transclude: true
  templateUrl: 'gi.commerce.summary.html'
  link: (scope,elem, attrs) ->
    scope.giCart = giCart
]
