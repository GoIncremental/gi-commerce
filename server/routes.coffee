configure = (app, rest) ->
  # rest.routeResource 'orders', app
  # , app.middleware.userAction, app.controllers.order
  #
  # rest.routeResource 'orderlines', app
  # , app.middleware.userAction, app.controllers.orderLine
  #
  # rest.routeResource 'products', app
  # , app.middleware.userAction, app.controllers.product

  rest.routeResource 'priceList', app
  , app.middleware.publicReadAction, app.controllers.priceList

  rest.routeResource 'currency', app
  , app.middleware.publicReadAction, app.controllers.currency

  rest.routeResource 'country', app
  , app.middleware.publicReadAction, app.controllers.country

  rest.routeResource 'territory', app
  , app.middleware.publicReadAction, app.controllers.territory

exports.configure = configure
