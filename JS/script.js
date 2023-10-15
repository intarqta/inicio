// Función interectiva para el menu superior
$(document).ready(function(){
    var altura = $('.container-fluid').offset().top;
    $(window).on('scroll',function(){
        if($(window).scrollTop() > altura){
            $('.container-fluid').addClass('active');

        }else{
            $('.container-fluid').removeClass('active');
        }
    })
})
