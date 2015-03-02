angular.module('gi.commerce').factory 'giOrderLine'
, ['$q', 'giCrud'
, ($q, Crud) ->

  crudService = Crud.factory 'orderlines', true

  forOrder = (orderId) ->
    deferred = $q.defer()
    crudService.query({orderId: orderId}).then (orderlines) ->
      deferred.resolve orderlines
    deferred.promise

  forCustomer = (customerId) ->
    deferred = $q.defer()
    crudService.query({'attributes.value': customerId}).then (orderlines) ->
      deferred.resolve orderlines
    deferred.promise

  forProduct = (productId) ->
    deferred = $q.defer()
    crudService.query({productId: productId}).then (orderlines) ->
      deferred.resolve orderlines
    deferred.promise

  findById: crudService.get
  get: crudService.get
  forOrder: forOrder
  save: crudService.save
  destroy: crudService.destroy
  forCustomer: forCustomer
  forProduct: forProduct
]
