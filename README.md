#gi-commerce
Part of the [goincremental](https://github.com/goincremental/gi) suite of modules.  This module provides Angular directives and services relating to checkout, cart and payment processing together with corresponding server side API modules.

##Installation instructions

Best served as a component of [gi](https://github.com/goincremental/gi) but if you desire to have it a la carte:

- Server side components: `npm install gi-commerce`
- Client side components: `bower install gi-commerce`

##Release Notes
v0.5.5
- Fixes country dropdown not populated on address form

v0.5.4
- Broadcast event from $rootScope on sucessful purchase completion
- Provide asset ids in charge request sent to server side checkout

v0.5.3
- Added tax Name to metadata sent to stripe for quaderno invoicing

v0.5.2
- Added stripe token generation from our form, no dependency on stripe's checkout.js
- Added tax calculations in cart overview page
- Added context to checkout 'Next' button allowing checkout stages to declare themselves valid, and stop progression if not valid.
- Added gi-cc-exp directive to validate credit card expiry date

v0.5.1
- Added support for pricing by market

v0.5.0
- Added needsShipping() method to giCart Service (uses the 'physical' boolean property of the item added to carts)
- Added cart now Calculates price based on Price List entry for item
- Added giPaymentInfo directive - a validated credit card entry form
- Added giCcCvc directive to validate credic card cvc numbers
- Added giCcNum directive to validate credit card numbers (luhn etc, uses giCardType)
- Added giCard service which uses giCardType and gives validation functions etc
- Added giCardType service supporting Visa, MasterCard, Amex, Diners Club, Discover, JCB and Union Pay card type regexes
- Added giCustomerInfo directive to capture customer info and address details
- Added giCustomerForm directive to capture customer name, email and company details
- Added giAddressFormField directive (needs to be nested in a parent form)
- Added acl to countries, currencies and price list models to enable public-read

v0.4.0
- Added Price List service and form.  Allows you to specify a multi currency price list for use later against a product.


##Acknowledgements

Much of the Card validation logic was derived from [bendrucker/creditcards](https://github.com/bendrucker/creditcards)

and the validation directives from
[bendrucker/angular-credit-cards](https://github.com/bendrucker/angular-credit-cards)

Both of which are licensed under [MIT](http://opensource.org/licenses/MIT)
