$(document).ready(function(){
  $('input[type="submit"]').prop('disabled', true);
  $('body').on('keyup', '.passCheck', function(){
    //TODO check if this value matches the corresponding .pass 
    // If not then the underlining should be in red, else blue
    var orig = $(this).parent().parent().parent().find('.pass');
    var check = $(this);
    var submit = $(this).parent().parent().parent().parent().find('input[type="submit"]');
    if (orig.val() == check.val() && orig.val().length >= 5){
      console.log('good');
      submit.prop('disabled', false);
    }
    else{
      submit.prop('disabled', true);
    }
  }); 
});
