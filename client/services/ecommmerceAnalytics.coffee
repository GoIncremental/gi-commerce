angular.module('gi.commerce').factory 'giEcommerceAnalytics'
, ['giLog', 'giAnalytics'
, (Log, Analytics) ->

  enhancedEcommerce = false
  if ga?
    google = ga

  requireGaPlugin = (x) ->
    Log.debug('ga requiring ' + x)
    if google?
      google 'require', x

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


  sendCartView: (obj, items) ->
    inCartProducts = []

    if google?
      if not enhancedEcommerce
        requireGaPlugin 'ec'

      if items?
        for i in items
          prod =
            id: i._data.id,
            name: i._name,
            quantity: i._quantity

          ga('ec:addProduct', prod)

      ga('ec:setAction', 'checkout', obj)
      ga('send', 'pageview')



  sendTransaction: (obj , items) ->
    id = ''
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    i = 0
    while i < 25
      id += possible.charAt(Math.floor(Math.random() * possible.length))
      i++

    rev = 0
    rev_old = 0
    if google?
      if not enhancedEcommerce
        requireGaPlugin 'ec'

    if items?
      for i in items

        rev_old ++ i._priceList?.prices?.US
        rev += parseFloat(i._priceList?.prices?.US)
        console.log '---'
        console.log sending transaction
        console.log rev
        console.log rev_old
        console.log '---'
        prod =
          id: i._data.name,
          name: i._data.displayName,
          price: "'" + i._priceList?.prices?.US  + "'" || ''
          quantity: i._quantity
        ga('ec:addProduct', prod)

    ga('ec:setAction', 'purchase', {id: id, revenue: rev})
    # ga('send', 'pageview')
    ga('send', 'event', 'Ecommerce', 'Purchase');



]
