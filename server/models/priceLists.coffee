module.exports = (dal) ->

  modelDefinition =
    name: 'PriceList'
    schemaDefinition:
      systemId: 'ObjectId'
      acl: 'String'
      name: 'String'
      prices: 'Mixed'
      ctaText: 'String'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
