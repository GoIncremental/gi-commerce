module.exports = (mongoose) ->
  orders: require('./orders')(mongoose)
  orderLines: require('./orderLines')(mongoose)
  products: require('./products')(mongoose)