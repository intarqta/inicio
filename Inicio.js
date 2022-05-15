
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