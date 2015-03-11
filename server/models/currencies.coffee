module.exports = (dal) ->

  modelDefinition =
    name: 'Currency'
    schemaDefinition:
      systemId: 'ObjectId'
      name: 'String'
      code: 'String'
      symbol: 'String'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
