gi = require 'gi-util'

module.exports = (model) ->
  crud = gi.common.crudControllerFactory model

  my = (req, res, next) ->
    model.findOneBy 'code', req.params.id, req.systemId, (err, obj) ->
      if err
        res.json 200, {message: err, percent: 0}
      else
        res.json 200, obj

  exports = gi.common.extend {}, crud
  exports.my = my
  exports
