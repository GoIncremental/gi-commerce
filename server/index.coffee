util = require 'util'
gint = require 'gint-util'
routes = require './routes'
configure = (app, mongoose) ->
  
  gint.common.extend app.models, require('./models')(mongoose, app.models.crud)
  gint.common.extend app.controllers, require('./controllers')(app)
  
  routes.configure app

exports.configure = configure