module.exports = (mongoose, crudModelFactory) ->

  Schema = mongoose.Schema
  ObjectId = Schema.Types.ObjectId

  modelName = 'Orderline'

  schema =
    orderId: ObjectId
    productId: ObjectId
    quantity: 'Number'
    price: 'Number'
    attributes: [
      name: 'String'
      value: 'String'
    ]

  mongoose.model modelName, schema
  exports = crudModelFactory mongoose.model(modelName)
  exports.name = modelName
  exports