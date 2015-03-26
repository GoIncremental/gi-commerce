angular.module('gi.commerce').filter 'giTerritoryId'
, [ 'giTerritory'
, (Model) ->
  (id) ->
    result = "N/A"
    if id?
      cur = Model.getCached(id)
      if cur?
        result = cur.code
    result
]
