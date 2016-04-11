Stripe.setPublishableKey('pk_test_LuReqVByWV1HR5HQTFjaEBSZ');

var stripeResponseHandler = function(status, response) {
  var $form = $('#payment-form');

  if (response.error) {
    // Show the errors on the form
    $form.find('.payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false);
  } else {
    // token contains id, last4, and card type
    //var foodId = $form.find('.food-id');//.getElementById('foodId').innerHTML;
    var foodId = '56b2ab18492664680f91b6c6';
    var token = response.id;
    // Insert the token into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    $form.append($('<input type="hidden" name="foodId" />').val(foodId));
    // and re-submit
    $form.get(0).submit();
  }
};

jQuery(function($) {
  $('#payment-form').submit(function(e) {
    var $form = $(this);

    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from submitting with the default action
    return false;
  });
});
