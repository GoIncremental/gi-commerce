angular.module('gi.commerce').config ['$routeProvider', '$locationProvider'
, ($routeProvider, $locationProvider) ->
  $routeProvider
  .when '/admin/priceList',
    templateUrl: 'gi.commerce.priceList.html'
]
