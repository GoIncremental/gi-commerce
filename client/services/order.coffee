angular.module('app').factory 'Order'
, ['$q', 'Crud', 'Customer', 'OrderLine'
, ($q, Crud, Customer, OrderLine) ->

  crudService = Crud.factory 'orders', true

  findById = (id, callback) ->
    crudService.get(id).then (order) ->
      order.orderLines = []
      Customer.getSimple order.owner.key, (customer) ->
        order.customer = customer
        OrderLine.forOrder(id).then (orderLines) ->
          count = 0
          angular.forEach orderLines, (orderLine) ->
            count = count + 1
            order.orderLines.push orderLine
            if count is orderLines.length
              callback(order) if callback
  
  forOwner = (ownerId) ->
    deferred = $q.defer()
    crudService.query({'owner.key': ownerId}).then (emails) ->
      deferred.resolve emails
    deferred.promise

  factory = () ->
    customerId: ''
    invoiceNumber: ''
    date: moment().format('DD/MM/YYYY')
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