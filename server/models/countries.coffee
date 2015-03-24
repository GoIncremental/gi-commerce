module.exports = (dal) ->

  modelDefinition =
    name: 'Country'
    schemaDefinition:
      systemId: 'ObjectId'
      name: 'String'
      code: 'String'
      currencyId: 'ObjectId'
      acl: 'String'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
