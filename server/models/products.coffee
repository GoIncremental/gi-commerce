gint = require 'gint-util'
async = require 'async'

module.exports = (mongoose, orderLines) ->

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

  objectSchema = mongoose.Schema schema

  objectSchema.virtual("stockLevel").get () ->
    @_stockLevel

  objectSchema.set 'toObject', {virtuals: true}

  objectSchema.methods.calculateStockLevel = (callback) ->
    #calculate the remaining stock level
    that = @
    options =
      query:
        productId: @_id

    orderLines.find options, (err, lines) ->
      that._stockLevel = that.stock
      if lines? and (not err)
        async.each lines
        , (line, done) ->
          that._stockLevel -= line.quantity
          done()
        , () ->
          callback()
      else
        callback()

  mongoose.model modelName, objectSchema
  
  crud = gint.models.crud mongoose.model(modelName)

  find = (options, callback) ->
    crud.find options, (err, results, pageCount) ->
      if err
        callback err, results, pageCount
      else
        async.map results
        , (result, done) ->
          #the async iterator called for each result
          result.calculateStockLevel () ->
            res = result.toObject()
            done null, res
        , (err, simpleResults) ->
          #the callback when all iterations have calledback
          callback err, simpleResults, pageCount
  
  findById = (id, callback) ->
    crud.findById id, (err, product) ->
      if err or not product?
        callback(err) if callback
      else
        product.calculateStockLevel () ->
          res = product.toObject()
          callback(err, res) if callback

  findOneBy = (key, value, callback) ->
    crud.findOneBy key, value, (err, product) ->
      if err or not product?
        callback(err) if callback
      else
        product.calculateStockLevel () ->
          res = product.toObject()
          callback(err, res) if callback

  find: find
  findById: findById
  findOneBy: findOneBy
  create: crud.create
  update: crud.update
  destroy: crud.destroy
  name: modelName