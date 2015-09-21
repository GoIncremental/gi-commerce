module.exports = (dal) ->

  modelDefinition =
    name: 'DiscountCode'
    schemaDefinition:
      systemId: 'ObjectId'
      code: 'String'
      percent: 'Number'
      active: 'String'
      startDate: 'Date'
      endDate: 'Date'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
