angular.module('gi.commerce').factory 'giCart'
, ['$rootScope', '$http', 'giCartItem', 'giLocalStorage', 'giCountry'
, 'giCurrency', 'giPayment', 'giMarket'
, ($rootScope, $http, giCartItem, store, Country, Currency, Payment, Market) ->
  cart = {}

  getPricingInfo = () ->
    marketCode: cart.market.code
    taxRate: cart.tax
    taxInclusive: cart.taxInclusive

  getItemById = (itemId) ->
    build = null
    angular.forEach cart.items,  (item) ->
      if item.getId() is itemId
        build = item
    build

  getSubTotal = () ->
    subTotal = 0
    priceInfo = getPricingInfo()
    angular.forEach cart.items, (item) ->
      subTotal += item.getSubTotal(priceInfo)

    +(subTotal).toFixed(2)

  getTaxTotal = () ->
    taxTotal = 0
    priceInfo = getPricingInfo()
    angular.forEach cart.items, (item) ->
      taxTotal += item.getTaxTotal(priceInfo)

    +(taxTotal).toFixed(2)

  init = () ->
    cart =
      tax : null
      taxName: ""
      items : []
      stage: 1
      validStages: {}
      country:
        code: 'GB'
      currency:
        code: 'GBP'
        symbol: '£'
      market:
        code: 'UK'
      company: {}
      taxInclusive: true

    return

  save = () ->
    store.set 'cart', JSON.stringify(cart)

  calculateTaxRate = () ->
    countryCode = cart.country.code
    uri = '/api/taxRate?countryCode=' + countryCode
    if c.company?.VAT?
      uri += '&vatNumber=' + c.company.VAT
    if c.billingAddress?.code?
      uri += '&postalCode=' + c.billingAddress.code

    $http.get(uri).success (data) ->
      cart.tax = data.rate
      cart.taxName = data.name
      cart.tax
    .error (err) ->
      cart.tax = -1
      cart.taxName = ""
      cart.tax

  #Below are the publicly exported functions
  c =
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

    setTaxRate: (tax) ->
      cart.tax = tax

    getTaxRate: () ->
      if cart.tax >= 0
        cart.tax
      else
        -1

    setTaxInclusive: (isInclusive) ->
      cart.taxInclusive = isInclusive

    getSubTotal: getSubTotal

    getTaxTotal: getTaxTotal

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

    setStageValidity: (stage, valid) ->
      cart.validStages[stage] = valid

    isStageInvalid: (stage) ->
      if cart.validStages[stage]?
        not cart.validStages[stage]
      else
        true

    getCurrencySymbol: () ->
      cart.currency.symbol

    getCurrencyCode: () ->
      cart.currency.code

    getCountryCode: () ->
      cart.country.code

    getPricingInfo: getPricingInfo

    setCustomer: (customer) ->
      @customer = customer

    setCountry: (code) ->
      Currency.all().then () ->
        Market.all()
        .then (markets) ->
          Country.getFromCode(code)
          .then (country) ->
            if country?
              cart.country = country
              cart.market = Market.getCached(cart.country.marketId)
              cart.currency = Currency.getCached(cart.market.currencyId)
              calculateTaxRate()

    calculateTaxRate: calculateTaxRate

    needsShipping: () ->
      result = false
      angular.forEach cart.items, (item) ->
        if item.needsShipping()
          result = true
      result

    totalItems: () ->
      cart.items.length

    totalCost:  () ->
      getSubTotal() + getTaxTotal()

    removeItem: (index) ->
      cart.items.splice index, 1
      $rootScope.$broadcast 'giCart:itemRemoved', {}
      $rootScope.$broadcast 'giCart:change', {}

    payNow: () ->
      that = @
      Payment.stripe.getToken(that.card).then (token) ->
        chargeRequest =
          token: token.id
          total: that.totalCost()
          billing: that.billingAddress
          shipping: that.shippingAddress
          customer: that.customer
          currency: that.getCurrencyCode().toLowerCase()
          tax:
            rate: cart.tax
            name: cart.taxName
          items: ({name: item._data.name, purchaseType: item._data.purchaseType}) for item in cart.items

        Payment.stripe.charge(chargeRequest).then (result) ->
          $rootScope.$broadcast('giCart:paymentCompleted')
          cart.stage = 4
        , (err) ->
          console.log 'charge failed'
          console.log err
      , (err) ->
        console.log 'failed to get stripe token'
        console.log err

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
  c
]
