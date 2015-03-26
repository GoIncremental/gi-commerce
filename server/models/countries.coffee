module.exports = (dal) ->

  modelDefinition =
    name: 'Country'
    schemaDefinition:
      systemId: 'ObjectId'
      name: 'String'
      code: 'String'
      territoryId: 'ObjectId'
      acl: 'String'
      default: 'Boolean'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
