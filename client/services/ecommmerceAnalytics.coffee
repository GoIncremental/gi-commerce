angular.module('gi.commerce').factory 'giEcommerceAnalytics'
, ['giLog', 'giAnalytics'
, (Log, Analytics) ->
  viewProductList: (name, items) ->
    Log.log 'Product list: ' + name + ' with: ' + items.length + ' items viewed'
    angular.forEach items, (item, idx) ->
      Log.log item
      impression =
        id: item.name
        name: item.displayName
        list: name
        position: idx + 1

      Analytics.Impression impression
    Analytics.PageView()

]
