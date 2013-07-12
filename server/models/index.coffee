module.exports = (mongoose) ->
  orderLines = require('./orderLines')(mongoose)
  orders: require('./orders')(mongoose)
  orderLines: orderLines
  products: require('./products')(mongoose, orderLines)