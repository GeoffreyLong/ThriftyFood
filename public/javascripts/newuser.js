// TODO refactor and make cleaner
// Also fix the username < 5 but still entering bug
$(document).ready(function(){
  $('body').on('keyup', 'input', function(){
    var userName = null;
    var pass = null;
    var passCheck = null;
    var submitBtn = null;
    if ($(this).hasClass('seller')){
      userName = $('#sellerUserField');
      pass = $('#sellerPass');
      passCheck = $('#sellerPassCheck');
      submitBtn = $('#sellerSubmit'); 
    }
    else{
      userName = $('#buyerUserField');
      pass = $('#buyerPass');
      passCheck = $('#buyerPassCheck');
      submitBtn = $('#buyerSubmit');
    }

    if (userName.val().length >= 5){
      userName.removeClass('invalid');
    }
    else{
      userName.addClass('invalid');
    }

    if (pass.val().length >= 5){
      pass.removeClass('invalid');
    }
    else{
      pass.addClass('invalid');
    }

    if (pass.val() == passCheck.val() && pass.val().length >= 5){
      passCheck.removeClass('invalid');
      passCheck.addClass('valid');
      pass.addClass('valid');
      userName.addClass('valid');
      submitBtn.prop('disabled', false);
    }
    else{
      passCheck.addClass('invalid');
      passCheck.removeClass('valid');
      pass.removeClass('valid');
      userName.removeClass('valid');
      submitBtn.prop('disabled', true);
    }
  });
});
