angular.module('app').factory 'Order'
, ['$q', 'Crud', 'Customer', 'OrderLine'
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
    crudService.query({'owner.key': ownerId}).then (emails) ->
      deferred.resolve emails
    deferred.promise

  factory = () ->
    customerId: ''
    invoiceNumber: ''
    date: moment()
    notes: ''
    attributes: [
      {name: "confirmationSent", value: "false"}
      ,{name: "excessDue", value: "0"}
    ]
  save = (item) ->
    deferred = $q.defer()
    item.date
    crudService.save(item)

    deferred.promise
  findById: findById
  get: findById
  destroy: crudService.destroy
  save: crudService.save
  factory: factory
  forOwner: forOwner

]