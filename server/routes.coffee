gint = require 'gint-util'
rest = gint.common.rest

module.exports = (app, auth, api) ->
  rest.routeResource 'orders',     app, auth.userAction, api.order
  rest.routeResource 'orderlines', app, auth.userAction, api.orderLine
  rest.routeResource 'products',    app, auth.userAction, api.product