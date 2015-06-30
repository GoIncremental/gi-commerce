angular.module('gi.commerce').directive 'giFocus'
, ['$timeout'
, ($timeout) ->
  restrict: A,
  link: (scope, element, attrs) ->
    scope.$watch(attrs.giFocus, (newVal) ->
        if newVal?
          element[0].focus()
          scope[attrs.giFocus] = false;
      )

]
