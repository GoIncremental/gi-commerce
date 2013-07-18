gint = require 'gint-util'
rest = gint.common.rest

configure = (app) ->
  rest.routeResource 'orders', app
  , app.middleware.userAction, app.controllers.order
  
  rest.routeResource 'orderlines', app
  , app.middleware.userAction, app.controllers.orderLine
  
  rest.routeResource 'products', app
  , app.middleware.userAction, app.controllers.product

exports.configure = configure