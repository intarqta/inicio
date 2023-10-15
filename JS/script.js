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
// Modificar el tamaño del footer al hacer scroll
// Función interectiva para el menu superior
$(document).ready(function(){
    var altura = $('#footer').offset().top;
  
    $(window).on('scroll',function(){
        if($(window).scrollTop() <600){ 
            $('footer').addClass('active');
            $('links').addClass('active');
            $('Copyright').addClass('active');            

        }else{
            $('footer').removeClass('active');
            $('links').removeClass('active');
            $('Copyright').removeClass('active');     
        }
    })
})
