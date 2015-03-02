angular.module('gi.commerce').factory 'giOrder'
, ['$q', 'giCrud', 'giCustomer', 'giOrderLine'
, ($q, Crud, Customer, OrderLine) ->

  crudService = Crud.factory 'orders', true

  findById = (id) ->
    deferred = $q.defer()

    crudService.get(id).then (order) ->
      if order? and order.owner?
        Customer.getSimple order.owner.key, (customer) ->
          order.customer = customer
          OrderLine.forOrder(id).then (orderLines) ->
            order.orderLines = orderLines
            deferred.resolve order
      else
        deferred.resolve()

    deferred.promise

  forOwner = (ownerId) ->
    deferred = $q.defer()
    crudService.query({'owner.key': ownerId}).then (orders) ->
      deferred.resolve orders
    deferred.promise

  factory = () ->
    customerId: ''
    invoiceNumber: ''
    date: moment().toDate()
    notes: ''
    attributes: [
      {name: "confirmationSent", value: "false"}
      ,{name: "excessDue", value: "0"}
    ]


  findById: findById
  get: findById
  destroy: crudService.destroy
  save: crudService.save
  factory: factory
  forOwner: forOwner

]
