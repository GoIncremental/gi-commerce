angular.module('gi.commerce').filter 'giCurrency'
, [ '$filter'
, ($filter) ->
  (amount, currencySymbol, fractionSize) ->
    if angular.isFunction(currencySymbol)
      currencySymbol = currencySymbol()
    $filter('currency')(amount, currencySymbol, fractionSize)

]

angular.module('gi.commerce').filter 'giCurrencyId'
, [ 'giCurrency'
, (Currency) ->
  (currencyId) ->
    result = "N/A"
    if currencyId?
      cur = Currency.getCached(currencyId)
      if cur?
        result = cur.symbol + ' ' + cur.code
    result
]
