angular.module('gi.commerce', ['gi.commerce.directives'])

  .config([() -> return])

  .provider('$giCart', () ->
    $get: () ->
      return
  )

  .run(['$rootScope', 'giCart','giCartItem', 'store'
  , ($rootScope, giCart, giCartItem, store) ->
    $rootScope.$on 'giCart:change', () ->
      giCart.$save()

    if angular.isObject(store.get('cart'))
      giCart.$restore(store.get('cart'))
    else
      giCart.init()
  ])

  .service('giCart', ['$rootScope', 'giCartItem', 'store'
  ,  ($rootScope, giCartItem, store) ->

      @init = () ->
        @$cart =
          shipping : null
          tax : null
          items : []
        return

      @addItem = (id, name, price, quantity, data) ->

        inCart = @getItemById(id)

        if angular.isObject(inCart)
          #Update quantity of an item if it's already in the cart
          inCart.setQuantity(quantity, false)
        else
          newItem = new giCartItem(id, name, price, quantity, data)
          @$cart.items.push(newItem)
          $rootScope.$broadcast('giCart:itemAdded', newItem)

        $rootScope.$broadcast('giCart:change', {})


      @getItemById = (itemId) ->
        items = @getCart().items

        build = null
        angular.forEach items,  (item) ->
          if item.getId() is itemId
            build = item
        build

      @setShipping = (shipping) ->
        @$cart.shipping = shipping

      @getShipping = () ->
        if @getCart().items.length == 0
          return 0
        @getCart().shipping

      @setTax = (tax) ->
        @$cart.tax = tax

      @getTax = () ->
        (@getSubTotal()/100) * @getCart().tax

      @setCart = (cart) ->
        @$cart = cart

      @getCart = () ->
        @$cart

      @getItems = () ->
        @getCart().items

      @totalItems = () ->
        @getCart().items.length

      @getSubTotal = () ->
        total = 0
        angular.forEach @getCart().items, (item) ->
          total += item.getTotal()
        total

      @totalCost =  () ->
        @getSubTotal() + @getShipping() + @getTax()

      @removeItem = (index) ->
        @$cart.items.splice(index, 1)
        $rootScope.$broadcast('giCart:itemRemoved', {})
        $rootScope.$broadcast('giCart:change', {})

      @empty = () ->
        @$cart.items = []
        localStorage.removeItem 'cart'

      @$restore = (storedCart) ->
        @init()
        @$cart.shipping = storedCart.shipping
        @$cart.tax = storedCart.tax

        angular.forEach storedCart.items, (item) =>
          @$cart.items.push(new giCartItem(
            item._id,  item._name, item._price, item._quantity, item._data)
          )

        @$save()

      @$save = () ->
        store.set 'cart', JSON.stringify(this.getCart())

      @
  ])

  .factory('giCartItem', ['$rootScope', 'store', ($rootScope, store) ->

    item = (id, name, price, quantity, data) ->
      @setId(id)
      @setName(name)
      @setPrice(price)
      @setQuantity(quantity)
      @setData(data)


    item.prototype.setId = (id) ->
      if (id)
        @_id = id
      else
        console.error('An ID must be provided')

    item.prototype.getId = () ->
      @_id

    item.prototype.setName = (name) ->
      if name
        @_name = name
      else
        console.error('A name must be provided')

    item.prototype.getName = () ->
      @_name

    item.prototype.setPrice = (price) ->
      price = parseFloat(price)
      if (price)
        if (price <= 0)
          console.error('A price must be over 0')
        @_price = (price)
      else
        console.error('A price must be provided')

    item.prototype.getPrice = () ->
      @_price

    item.prototype.setQuantity = (quantity, relative) ->
      quantity = parseInt(quantity)
      if (quantity % 1 is 0)
        if (relative is true)
          @_quantity += quantity
        else
          @_quantity = quantity

        if (this._quantity < 1)
          @_quantity = 1

      else
        @_quantity = 1
        console.info('Quantity must be an integer and was defaulted to 1')
      $rootScope.$broadcast('giCart:change', {})

    item.prototype.getQuantity = () ->
      @_quantity

    item.prototype.setData = (data) ->
      if (data)
        @_data = data
      return

    item.prototype.getData = () ->
      if @_data?
        return @_data;
      else
        console.info('This item has no data')
        return

    item.prototype.getTotal =  () ->
      @getQuantity() * @getPrice()

    item

  ])

  .service('store', ['$window', ($window) ->
    get: (key) ->
      if $window.localStorage[key]
        cart = angular.fromJson($window.localStorage[key])
        return JSON.parse(cart)
      false

    set: (key, val) ->
      if not val?
        $window.localStorage.removeItem(key)
      else
        $window.localStorage[key] = angular.toJson(val)
      $window.localStorage[key]
  ])

  .controller('CartController', ['$scope', 'giCart', ($scope, giCart) ->
    $scope.giCart = giCart
  ])

  .value('version', '0.0.1-rc.2')

angular.module('gi.commerce.directives', [])

  .controller('gicartController',['$scope', 'giCart', ($scope, giCart) ->
    $scope.giCart = giCart
  ])

  .directive('gicartAddtocart', ['giCart', (giCart) ->

    restrict : 'E'
    controller : 'gicartController'
    scope:
      id: '@'
      name: '@'
      quantity: '@'
      price: '@'
      data: '='
    transclude: true
    templateUrl: 'gi.commerce.addtocart.html'
    link: (scope, element, attrs) ->
      scope.attrs = attrs
      scope.inCart = () ->
        giCart.getItemById(attrs.id)

  ])

  .directive('gicartCart', ['giCart', (giCart) ->
    restrict : 'E',
    controller : 'CartController',
    scope: {},
    templateUrl: 'gi.commerce.cart.html',
  ])

  .directive('gicartSummary', ['giCart', (giCart) ->
    restrict : 'E',
    controller : 'CartController',
    scope: {},
    transclude: true,
    templateUrl: 'gi.commerce.summary.html'
  ])
