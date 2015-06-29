#gi-commerce
Part of the [goincremental](https://github.com/goincremental/gi) suite of modules.  This module provides Angular directives and services relating to checkout, cart and payment processing together with corresponding server side API modules.

##Installation instructions

Best served as a component of [gi](https://github.com/goincremental/gi) but if you desire to have it a la carte:

- Server side components: `npm install gi-commerce`
- Client side components: `bower install gi-commerce`

##Release Notes

v0.6.6
- fixes issue with credit card validation where it would eagerly validate invalid numbers (especially visa)

v0.6.5
- resolve tab ordering on payment forms
- provide feedback when processing payment

v0.6.4
- tidy up mobile cart styling
- added spinner when tax is being calculated
- recalculate tax after vat number entered.

v0.6.3
- Pass company info along with charge request to /api/checkout

v0.6.2
- Use giUtil regex for email validation during checkout

v0.6.1
- Summary directive now displays total quantity of items, not just number of distinct items
- Fixes issue where register user was called too frequently in the checkout process
- Fixes issue where cart was JSON stringified twice in local storage

v0.6.0
- added giPaymentThanks directive allowing the application to inject their own thankyou directive.
- To achieve this giCart has become a provider, exposing a setThankyouDirective function which accepts a string which will be used to create an element (so typically you'll use the name of your custom directive that you want injecting on the thankyou page)

v0.5.17
- Clear cart after sucessful purchase
- Moved login watcher to checkout so it always fires regardless of where you are in the checkout process.

v0.5.16
- Cart is now mobile responsive on xs screens.
- Order Summary now displays correctly on xs and sm screens.

v0.5.15
- triggers 'giCart:accountRequired' event on $rootScope with account info details when new account is required.  Consuming applications should respond to this event by creating an account.

v0.5.14
- added validation for account username as part of checkout processing

v0.5.13
- remove <pre> formatting in customer form

v0.5.12
- Added validation of passwords and password confirmation

v0.5.11
- Changed Styling of customer info capture box to disable company name / vat number fields rather than show / hiding them.

v0.5.10
- Added giEcommerceAnalytics service.  For now only a viewProductList event is supported, more to follow.

v0.5.9
- Styling changes

v0.5.8
- Added continue shopping button to first page of checkout

v0.5.7
- Fixes an issue where quaderno environment variables not loaded in time.

v0.5.6
- Broadcasts giCart:paymentFailed event when payment fails

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
