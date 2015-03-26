angular.module('gi.commerce').factory 'giCart'
, ['$rootScope', 'giCartItem', 'giLocalStorage', 'giCountry'
, 'giCurrency', 'giPayment', 'giTerritory'
, ($rootScope, giCartItem, store, Country, Currency, Payment, Territory) ->
  cart = {}

  getItemById = (itemId) ->
    build = null
    angular.forEach cart.items,  (item) ->
      if item.getId() is itemId
        build = item
    build

  getSubTotal = () ->
    total = 0
    angular.forEach cart.items, (item) ->
      total += item.getTotal(cart.territory.code)
    total

  init = () ->
    cart =
      tax : 0
      items : []
      stage: 1
      country:
        code: 'GB'
      currency:
        code: 'GBP'
        symbol: '£'
      territory:
        code: 'UK'
    return

  save = () ->
    store.set 'cart', JSON.stringify(cart)

  #Below are the publicly exported functions
  init: init

  addItem: (id, name, priceList, quantity, data) ->

    inCart = getItemById(id)

    if angular.isObject(inCart)
      #Update quantity of an item if it's already in the cart
      inCart.setQuantity(quantity, false)
    else
      newItem = new giCartItem(id, name, priceList, quantity, data)
      cart.items.push(newItem)
      $rootScope.$broadcast('giCart:itemAdded', newItem)

    $rootScope.$broadcast('giCart:change', {})

  setTax: (tax) ->
    cart.tax = tax

  getTax: () ->
    if cart.tax > 0
      sub = getSubTotal()
      (getSubTotal()/100) * cart.tax
    else
      0

  getSubTotal: getSubTotal

  getItems: () ->
    cart.items

  getStage: () ->
    cart.stage

  nextStage: () ->
    if cart.stage < 4
      cart.stage += 1

  prevStage: () ->
    if cart.stage > 1
      cart.stage -= 1

  setStage: (stage) ->
    if stage > 0 and stage < 4
      cart.stage = stage

  getCurrencySymbol: () ->
    cart.currency.symbol

  getCurrencyCode: () ->
    cart.currency.code

  getCountryCode: () ->
    cart.country.code

  getTerritoryCode: () ->
    cart.territory.code

  setCountry: (code) ->
    Currency.all().then () ->
      Territory.all()
      .then (territories) ->
        Country.getFromCode(code)
        .then (country) ->
          if country?
            cart.country = country
            cart.territory = Territory.getCached(cart.country.territoryId)
            cart.currency = Currency.getCached(cart.territory.currencyId)

  needsShipping: () ->
    result = false
    angular.forEach cart.items, (item) ->
      if item.needsShipping()
        result = true
    result

  totalItems: () ->
    cart.items.length

  totalCost:  () ->
    getSubTotal()

  removeItem: (index) ->
    cart.items.splice index, 1
    $rootScope.$broadcast 'giCart:itemRemoved', {}
    $rootScope.$broadcast 'giCart:change', {}

  empty: () ->
    cart.items = []
    localStorage.removeItem 'cart'

  save: save

  restore: (storedCart) ->
    init()
    cart.tax = storedCart.tax

    angular.forEach storedCart.items, (item) ->
      cart.items.push(new giCartItem(
        item._id,  item._name, item._priceList, item._quantity, item._data)
      )

    save()
]
