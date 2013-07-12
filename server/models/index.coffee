module.exports = (mongoose) ->
  orderLines = require('./orderLines')(mongoose)

  orderLines: orderLines
  orders: require('./orders')(mongoose, orderLines)
  products: require('./products')(mongoose, orderLines)