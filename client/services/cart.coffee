angular.module('gi.commerce').provider 'giCart', () ->
  thankyouDirective = ""

  @setThankyouDirective = (d) ->
    thankyouDirective = d

  @$get = ['$q', '$rootScope', '$http', 'giCartItem', 'giLocalStorage'
  , 'giCountry', 'giCurrency', 'giPayment', 'giMarket', 'giUtil', '$window', 'giEcommerceAnalytics', 'giDiscountCode'
  , ($q, $rootScope, $http, giCartItem, store, Country, Currency, Payment
  , Market, Util, $window, giEcommerceAnalytics, Discount) ->
    cart = {}



    getPricingInfo = () ->
      marketCode: cart.market.code
      taxRate: cart.tax
      taxInclusive: cart.taxInclusive
      taxExempt: cart.taxExempt

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
      taxSavings = taxTotal  *  (cart.discountPercent / 100)
      taxTotal = taxTotal - taxSavings
      +(taxTotal).toFixed(2)




    init = () ->
      cart =
        tax : null
        taxName: ""
        taxExempt: false
        items : []
        stage: 1
        validStages: {}
        isValid: true
        country:
          code: 'GB'
        currency:
          code: 'GBP'
          symbol: '£'
        market:
          code: 'UK'
        company: {}
        taxInclusive: true
        taxApplicable: false
        discountPercent: 0
      return

    save = () ->
      store.set 'cart', cart



    calculateTaxRate = (code) ->
      vatNumber = code or c.company?.VAT
      deferred = $q.defer()
      countryCode = cart.country.code
      uri = '/api/taxRate?countryCode=' + countryCode

      $http.get(uri).success (data) ->
        cart.tax = data.rate
        cart.taxName = data.name
        cart.taxApplicable = (data.rate > 0)

        if (cart.tax > 0) and vatNumber?
          exp = Util.vatRegex
          match = exp.exec(vatNumber)
          if match?
            uri = '/api/taxRate?countryCode=' + match[1]
            uri += '&vatNumber=' + match[0]

          if c.billingAddress?.code?
            uri += '&postalCode=' + c.billingAddress.code

          $http.get(uri).success (exemptionData) ->
            cart.taxExempt = data.name? and (exemptionData.rate is 0)
            deferred.resolve exemptionData
          .error (err) ->
            deferred.resolve data
        else
          deferred.resolve data

      .error (err) ->
        cart.tax = -1
        cart.taxName = ""
        cart.taxExempt = false
        cart.taxApplicable = false
        deferred.reject error

      deferred.promise

    #Below are the publicly exported functions
    c =
      init: init

      checkCode: (code) ->
        deferred = $q.defer()
        cart.discountPercent = 0
        if code? and code isnt ''
          uri = '/api/discountCodes/my/' + code
          $http.get(uri).success( (data, status) ->
            if data?
              cart.discountPercent = data.percent
            deferred.resolve(cart.discountPercent)
          ).error (data) ->
            deferred.reject 'Could not check code'
        else
          deferred.reject 'No code supplied'
        deferred.promise



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

      isTaxApplicable: () ->
        cart.taxApplicable

      getDiscount: () ->
        cart.discountPercent

      isTaxExempt: () ->
        cart.taxExempt

      taxName: () ->
        cart.taxName

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

      setValidity: (valid) ->
        cart.isValid = valid

      isStageInvalid: (stage) ->
        if cart.validStages[stage]?
          not (cart.isValid and cart.validStages[stage])
        else
          not cart.isValid

      getCurrencySymbol: () ->
        cart.currency.symbol

      getCurrencyCode: () ->
        cart.currency.code

      getCountryCode: () ->
        cart.country.code

      getPricingInfo: getPricingInfo

      setCustomer: (customer) ->
        @customer = customer

      getLastPurchase: () ->
        cart.lastPurchase

      thankyouDirective: thankyouDirective

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

      totalQuantity: () ->
        result = 0
        angular.forEach cart.items, (item) ->
          result += item._quantity

        result

      totalCost:  () ->
        percentage = (cart.discountPercent / 100)
        subTot = getSubTotal()
        tot = getSubTotal() + getTaxTotal()
        cart.savings = (percentage * subTot)
        tot - (percentage * subTot)

      discount: () ->
        cart.savings

      hasDiscount: () ->
        if cart.savings
          return true
        else
          return false

      removeItem: (index) ->
        cart.items.splice index, 1
        $rootScope.$broadcast 'giCart:itemRemoved', {}
        $rootScope.$broadcast 'giCart:change', {}

      continueShopping: () ->
        $window.history.back()

      checkAccount: () ->
        if @customerInfo and (not @customer)
          $rootScope.$broadcast('giCart:accountRequired', @customerInfo)
        if @billingAddress
          @billingAddress.userId = @customer._id
          if @billingAddress._id?
            $http.put('/api/Addresses/' + @billingAddress._id, @billingAddress)
          else
            $http.post('/api/Addresses/', @billingAddress)
        if @shippingAddress
          console.log(@shippingAddress)
          @shippingAddress.userId = @customer._id
          if @shippingAddress._id?
            $http.put('/api/Addresses/' + @shippingAddress._id, @shippingAddress)
          else
            $http.post('/api/Addresses/', @shippingAddress)
        cart.stage += 1

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
            items: ({id: item._data._id, name: item._data.name, purchaseType: item._data.purchaseType}) for item in cart.items

          if that.company?
            chargeRequest.company = that.company

          Payment.stripe.charge(chargeRequest).then (result) ->
            $rootScope.$broadcast('giCart:paymentCompleted')
            giEcommerceAnalytics.sendTransaction({ step: 4, option: 'Transaction Complete'}, cart.items)
            that.empty()
            cart.stage = 4
          , (err) ->
            $rootScope.$broadcast('giCart:paymentFailed', err)
        , (err) ->
          $rootScope.$broadcast('giCart:paymentFailed', err)

      empty: () ->
        @billingAddress = {}
        @shippingAddress = {}
        @customerInfo = {}
        @card = {}
        @company = {}
        cart.lastPurchase = cart.items.slice 0
        cart.items = []
        localStorage.removeItem 'cart'

      save: save


      sendCart: (opt) ->
        giEcommerceAnalytics.sendCartView({ step: cart.stage, option: opt}, cart.items)


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

  @
