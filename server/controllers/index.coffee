module.exports = (models, gint) ->
  order:  gint.controllers.crud(models.orders)
  orderLine: gint.controllers.crud(models.orderLines)
  product: gint.controllers.crud(models.products)