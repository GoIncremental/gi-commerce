module.exports = (dal) ->

  modelDefinition =
    name: 'Address'
    schemaDefinition:
      systemId: 'ObjectId'
      name:		'String'
      line1:	'String'
      line2:	'String'
      city:		'String'
      state:	'String'
      code:		'String'
      country:	'String'
      userId:	'ObjectId'

  modelDefinition.schema = dal.schemaFactory modelDefinition
  model = dal.modelFactory modelDefinition
  dal.crudFactory model
