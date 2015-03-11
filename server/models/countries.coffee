module.exports = (dal) ->

  modelDefinition =
    name: 'Country'
    schemaDefinition:
      systemId: 'ObjectId'
      name: 'String'
      code: 'String'
      currencyId: 'ObjectId'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
