module.exports = (dal) ->

  modelDefinition =
    name: 'Territory'
    schemaDefinition:
      systemId: 'ObjectId'
      name: 'String'
      code: 'String'
      currencyId: 'ObjectId'
      acl: 'String'
      default: 'Boolean'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
