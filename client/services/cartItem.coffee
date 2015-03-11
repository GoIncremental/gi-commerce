angular.module('gi.commerce').factory 'giCartItem'
, ['$rootScope', 'giLocalStorage'
, ($rootScope, store) ->

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

]
