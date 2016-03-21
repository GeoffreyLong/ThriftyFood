// TODO refactor and make cleaner
// Also fix the username < 5 but still entering bug
$(document).ready(function(){
  $('body').on('keyup', 'input', function(){
    var userName = $('#username');
    var pass = $('#password');
    var passCheck = $('#passwordCheck');
    var submitBtn = $('#submit');

    if ($(this).val().length < 5 && $(this).val().length != 0){
      $(this).addClass('invalid');
    }
    else{
      $(this).removeClass('invalid');
    }

    if (pass.val() == passCheck.val() && pass.val().length >= 5 && userName.val().length >= 5){
      passCheck.addClass('valid');
      pass.addClass('valid');
      userName.addClass('valid');
      submitBtn.prop('disabled', false);
    }
    else{
      passCheck.removeClass('valid');
      pass.removeClass('valid');
      userName.removeClass('valid');
      submitBtn.prop('disabled', true);
    }
  });
});
