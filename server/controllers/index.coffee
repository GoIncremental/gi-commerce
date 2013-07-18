module.exports = (app) ->
  order:  app.controllers.crud(app.models.orders)
  orderLine: app.controllers.crud(app.models.orderLines)
  product: app.controllers.crud(app.models.products)