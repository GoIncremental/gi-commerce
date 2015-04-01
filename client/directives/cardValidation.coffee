angular.module('gi.commerce').directive 'giCcNum'
, ['$parse','giCard'
, ($parse, Card) ->
  restrict: 'A'
  require: 'ngModel'
  compile: (elem, attrs) ->
    attrs.$set 'pattern', '[0-9]*'
    card = Card.card

    linkFn = ($scope, elem, attrs, controller) ->
      ngModelController = controller

      $scope.$watch attrs.ngModel, (number) ->
        ngModelController.$giCcType = card.type(number)
        return

      $viewValue = () ->
        ngModelController.$viewValue

      if attrs.ccEagerType?
        $scope.$watch $viewValue, (number) ->
          if number?
            number = card.parse(number)
            res = card.type(number, true)
            ngModelController.$giCcEagerType = res
          return

      $scope.$watch attrs.giCcType, (type) ->
        ngModelController.$validate()
        return

      ngModelController.$parsers.unshift (number) ->
        card.parse number

      ngModelController.$validators.giCcNumber = (number) ->
        card.isValid number

      ngModelController.$validators.giCcNumberType = (number) ->
        card.isValid number, $parse(attrs.giCcType)($scope)


    #return the linking function
    linkFn
]

angular.module('gi.commerce').directive 'giCcExp'
, ['$parse'
, ($parse) ->
  restrict: 'A'
  require: 'ngModel'
  compile: (elem, attrs) ->
    attrs.$set 'pattern', '[0-9]*'

    linkFn = ($scope, elem, attrs, controller) ->
      ngModelController = controller

      $viewValue = () ->
        ngModelController.$viewValue

      ngModelController.$validators.giCcExp = (x) ->
        exp = /^(0[1-9]|1[0-2])\/?(?:20)?([0-9]{2})$/
        match = exp.exec(x)
        if match?
          date = moment.utc()
          givenExpiry = moment.utc(match[1] + '-' + match[2], "MM-YY").endOf('Month')
          date.isBefore(givenExpiry)
        else
          false


    #return the linking function
    linkFn
]

angular.module('gi.commerce').directive 'giCcCvc'
, ['$parse','giCard'
, ($parse, Card) ->
  restrict: 'A'
  require: 'ngModel'
  compile: (elem, attrs) ->
    attrs.$set('maxlength', 4)
    attrs.$set('pattern', '[0-9]*')
    cvc = Card.cvc
    linkFn = ($scope, elem, attrs, controller) ->
      controller.$validators.giCcCvc = (value) ->
        cvc.isValid value, $parse(attrs.giCcType)($scope)

      $scope.$watch attrs.giCcType, (x) ->
        controller.$validate()
        return

    linkFn
]
