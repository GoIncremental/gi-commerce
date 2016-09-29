request = require 'request'


module.exports = () ->
  quadernoAPI = process.env['QUADERNO_URL']
  quadernoKey = process.env['QUADERNO_KEY']

  getTaxRate: (req, res) ->
    console.log '---'
    console.log 'in quaaderno get tax rate'
    code = req.query.countryCode or 'GB'

    url = quadernoAPI + '/api/v1/taxes/calculate.json?country=' + code
    if req.query.vatNumber?
      url += '&vat_number=' + req.query.vatNumber
    if req.query.postalCode?
      url += '&postal_code' + req.query.postalCode
    auth =
      user: quadernoKey
      pass: "x"
    
    console.log url
    console.log auth

    request.get url, {auth: auth}, (err, response, body) ->
      if err?
        console.log 'error!'
        console.log err
        res.json 500, err
      else
        console.log 'response!'
        out = JSON.parse(body)
        console.log out
        res.json 200, out
