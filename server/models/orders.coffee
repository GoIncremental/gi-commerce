async = require 'async'
module.exports = (mongoose, orderLines, crudModelFactory) ->

  Schema = mongoose.Schema
  ObjectId = Schema.Types.ObjectId

  modelName = 'Order'

  schema =
    owner:
      key: ObjectId
      resourceType: 'String'
    date: 'Date'
    invoiceNumber: 'String'
    notes: 'String'
    attributes: [
      name: 'String'
      value: 'String'
    ]
  
  mongoose.model modelName, schema
  
  crud = crudModelFactory mongoose.model(modelName)

  destroy = (id, systemId, callback) ->
    #first find all associated Order Lines
    options =
      query:
        orderId: id
        systemId: systemId

    orderLines.find options, (err, lines) ->
      if lines? and (not err)
        async.each lines
        , (line, done) ->
          console.log 'destroying an order line'
          orderLines.destroy line._id, done
        , () ->
          console.log 'then destroying an order'
          crud.destroy id, callback
      else
        console.log 'just destryoing an order'
        crud.destroy id, systemId callback
  
  find: crud.find
  findById: crud.findById
  findOneBy: crud.findOneBy
  create: crud.create
  update: crud.update
  destroy: destroy
  name: modelName