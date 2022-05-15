
const logonav = document.querySelectorAll('.logo-nav');
const panel = document.querySelectorAll('.panel');

//cuando se hace click en un nav 
logonav.forEach((cadanav, i)=>{
    logonav[0].classList.add('active');
    panel[0].classList.add('active');
    logonav[i].addEventListener('click', () =>{
        logonav.forEach((cadanav, i) =>{
            logonav[i].classList.remove('active');
            panel[i].classList.remove('active');
        })
        logonav[i].classList.add('active');
        panel[i].classList.add('active');
    })

})

// En modo celular al hacer click ene l boton del menú se despliega el menu

const botonMenu = document.getElementById('boton-menu-a');
const botonCerrarMenu = document.getElementById('boton-menu-c');
const pestLateral = document.getElementById('contenedor-pestaña');

botonMenu.addEventListener('click', function(){
    pestLateral.classList.add('active');
    botonMenu.classList.add('active');
    botonCerrarMenu.classList.add('active');
    
})
botonCerrarMenu.addEventListener('click', function(){
    pestLateral.classList.remove('active');
    botonMenu.classList.remove('active');
    botonCerrarMenu.classList.remove('active');
})
