request = require 'request'
quadernoAPI = process.env['QUADERNO_URL']
quadernoKey = process.env['QUADERNO_KEY']

module.exports =
  getTaxRate: (req, res) ->
    code = req.query.countryCode or 'GB'

    url = quadernoAPI + '/api/v1/taxes/calculate.json?country=' + code
    if req.query.vatNumber?
      url += '&vat_number=' + req.query.vatNumber
    if req.query.postalCode?
      url += '&postal_code' + req.query.postalCode
    auth =
      user: quadernoKey
      pass: "x"

    request.get url, {auth: auth}, (err, response, body) ->
      out = JSON.parse(body)
      res.json 200, out
