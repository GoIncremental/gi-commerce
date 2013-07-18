module.exports = (mongoose, crudModelFactory) ->
  orderLines = require('./orderLines')(mongoose, crudModelFactory)

  orderLines: orderLines
  orders: require('./orders')(mongoose, orderLines, crudModelFactory)
  products: require('./products')(mongoose, orderLines, crudModelFactory)