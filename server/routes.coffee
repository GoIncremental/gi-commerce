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

  rest.routeResource 'discountCode', app
  , app.middleware.adminAction, app.controllers.discountCode

  rest.routeResource 'currency', app
  , app.middleware.publicReadAction, app.controllers.currency

  rest.routeResource 'country', app
  , app.middleware.publicReadAction, app.controllers.country

  rest.routeResource 'market', app
  , app.middleware.publicReadAction, app.controllers.market

  app.get '/api/taxRate', app.middleware.publicAction
  , app.controllers.quaderno.getTaxRate

  app.get '/api/discountCodes/my/:id', app.middleware.publicAction
  , app.controllers.discountCode.my
  
  app.post '/api/address', app
  , app.controllers.address.create

exports.configure = configure
