util = require 'util'
gint = require 'gint-util'

module.exports = (app, mongoose, auth) ->
  
  models = require('./models')(mongoose)
  controllers = require('./controllers')(models, gint)
  
  require('./routes')(app, auth, controllers)

  models: models
  controllers: controllers