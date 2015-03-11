gi = require 'gi-util'
routes = require './routes'
controllers = require './controllers'
modelsFactory = require './models'
configure = (app, dal, options) ->

  models = modelsFactory dal, options
  gi.common.extend app.models, models
  gi.common.extend app.controllers, controllers(app)

  routes.configure app, gi.common.rest

module.exports =
  configure: configure
