angular.module('gi.commerce').factory 'giCartItem'
, ['$rootScope', 'giLocalStorage'
, ($rootScope, store) ->

  item = (id, name, priceList, quantity,data) ->
    @setId(id)
    @setName(name)
    @setPriceList(priceList)
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

  item.prototype.setPriceList = (priceList) ->
    if priceList?
      @_priceList = priceList
    else
      console.error('A Price List must be provided')

  item.prototype.getPrice = (territoryCode) ->
    if @_priceList?.prices?[territoryCode]?
      @_priceList.prices[territoryCode]
    else
      0

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

  item.prototype.getTotal =  (territoryCode) ->
    @getQuantity() * @getPrice(territoryCode)

  item.prototype.needsShipping = () ->
    @_data.physical

  item

]
