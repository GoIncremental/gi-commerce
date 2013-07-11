gint = require 'gint-util'
module.exports = (mongoose) ->

  Schema = mongoose.Schema
  ObjectId = Schema.Types.ObjectId

  modelName = 'Product'

  schema =
    systemId: ObjectId
    parentId: ObjectId
    title: 'String'
    description: 'String'
    stock: 'Number'
    detail: 'String'
    notes: 'String'
    price: 'Number'
    classification: 'String'
    date: 
      type: 'Date'
      default: Date.now
    visible: 'Boolean'
    slug: 'String'
    order: 'Number'
    link: 'String'
    categories: [ObjectId]

  mongoose.model modelName, schema
  exports = gint.models.crud mongoose.model(modelName)
  exports.name = modelName
  exports