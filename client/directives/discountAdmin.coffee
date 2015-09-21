angular.module('gi.commerce').directive 'giDiscountAdmin'
, ['giDiscountCode', (giDiscountCode) ->
  restrict: 'E'
  templateUrl: 'gi.commerce.discountAdmin.html'
  link: ($scope, elem, attrs) ->

    $scope.selected = false
    $scope.code = {}
    $scope.editCode = {}
    $scope.editIndex = ''



    giDiscountCode.all().then (data) ->
      $scope.currentCodes = data

    $scope.create = (code) ->
      code.active = 'Active'
      giDiscountCode.save(code)
      $scope.code = {}

    $scope.delete = (code) ->
      giDiscountCode.destroy(code._id).then (data) ->
    $scope.edit = (code, index) ->
       $scope.editIndex = index
       $scope.selected = true
       $scope.editCode = angular.copy(code)

    $scope.save = (code) ->
       giDiscountCode.save(code).then () ->





]
