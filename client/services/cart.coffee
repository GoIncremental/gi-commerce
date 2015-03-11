angular.module('gi.commerce').factory 'giCart'
, ['$rootScope', 'giCartItem', 'giLocalStorage', 'giCurrency'
, ($rootScope, giCartItem, store, Currency) ->
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
      total += item.getTotal()
    total

  getShipping = () ->
    if cart.items.length == 0
      return 0
    cart.shipping


  init = () ->
    cart =
      shipping : null
      tax : null
      items : []
      stage: 1
      currency:
        code: 'GBP'
        symbol: '£'
    return

  save = () ->
    store.set 'cart', JSON.stringify(cart)

  #Below are the publicly exported functions
  init: init

  addItem: (id, name, price, quantity, data) ->

    inCart = getItemById(id)

    if angular.isObject(inCart)
      #Update quantity of an item if it's already in the cart
      inCart.setQuantity(quantity, false)
    else
      newItem = new giCartItem(id, name, price, quantity, data)
      cart.items.push(newItem)
      $rootScope.$broadcast('giCart:itemAdded', newItem)

    $rootScope.$broadcast('giCart:change', {})

  setShipping: (shipping) ->
    cart.shipping = shipping

  getShipping: getShipping

  setTax: (tax) ->
    cart.tax = tax

  getTax: () ->
    sub = getSubTotal()
    (getSubTotal()/100) * cart.tax

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

  setCountry: (code) ->
    Currency.getFromCountryCode(code)
    .then (currency) ->
      if currency?
        cart.currency = currency

  totalItems: () ->
    cart.items.length

  totalCost:  () ->
    getSubTotal() + getShipping() + @getTax()

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
    cart.shipping = storedCart.shipping
    cart.tax = storedCart.tax

    angular.forEach storedCart.items, (item) ->
      cart.items.push(new giCartItem(
        item._id,  item._name, item._price, item._quantity, item._data)
      )

    save()
]
