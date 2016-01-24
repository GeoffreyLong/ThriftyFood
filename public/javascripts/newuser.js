$(document).ready(function(){
  $('input[type="submit"]').prop('disabled', true);
  $('body').on('keyup', '.userfield', function(){
    var check = $(this);
    if (check.val().length >= 5 || check.val().length == 0){
      check.removeClass('invalid');
    }
    else{
      check.addClass('invalid');
    }
  }); 
  $('body').on('keyup', '.pass', function(){
    var check = $(this);
    if (check.val().length >= 5 || check.val().length == 0){
      check.removeClass('invalid');
    }
    else{
      check.addClass('invalid');
    }
  }); 
  $('body').on('keyup', '.passCheck', function(){
    //TODO check if this value matches the corresponding .pass 
    // If not then the underlining should be in red, else blue
    var check = $(this);
    var table = $(this).parent().parent().parent().parent();
    var orig = table.find('.pass');
    var submit = table.find('input[type="submit"]');
    var userfield = table.find('.userfield');
    if (orig.val() == check.val() && orig.val().length >= 5){
      orig.addClass('valid');
      check.addClass('valid');
      userfield.addClass('valid');
      check.removeClass('invalid');
      submit.prop('disabled', false);
    }
    else{
      orig.removeClass('valid');
      check.removeClass('valid');
      userfield.removeClass('valid');
      check.addClass('invalid');
      submit.prop('disabled', true);
    }
    if (check.val().length == 0){
      check.removeClass('invalid');
    }
  }); 
});
