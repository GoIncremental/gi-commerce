gint = require 'gint-util'
module.exports = (mongoose) ->

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
  exports = gint.models.crud mongoose.model(modelName)
  exports.name = modelName
  exports