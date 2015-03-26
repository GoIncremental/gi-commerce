angular.module('gi.commerce').directive 'giTerritoryForm'
, ['$q', 'giCrud', 'giTerritory'
, ($q, Crud, Model) ->
  Crud.formDirectiveFactory('Territory', Model)
]
