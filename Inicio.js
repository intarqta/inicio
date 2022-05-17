
const logonav = document.querySelectorAll('.logo-nav');
const panel = document.querySelectorAll('.panel');
const tLogo = document.querySelectorAll('#logo-nav-img');
//cuando se hace click en un nav 
logonav.forEach((cadanav, i)=>{
    logonav[0].classList.add('active');
    panel[0].classList.add('active');
    tLogo[0].classList.add('active');
    logonav[i].addEventListener('click', () =>{
        logonav.forEach((cadanav, i) =>{
            logonav[i].classList.remove('active');
            panel[i].classList.remove('active');
            tLogo[i].classList.remove('active');
        })
        logonav[i].classList.add('active');
        panel[i].classList.add('active');
        tLogo[i].classList.add('active');
        
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

// Gráficas mediante Chart.js
let graStockGanadero = document.getElementById('gra-panel-gan').getContext("2d");

// Función que permite extraer datos desde google sheets 

fetch('https://sheets.googleapis.com/v4/spreadsheets/1lhEM-P2yW2MqMAaGeuUn9VVJbYK7fPhRKPnoOKkyvP8/values/Hoja 1!A1:AW?key=AIzaSyAmXGXaGj8Gy6a5HvlJAMGms1fsnciHlEI')
    .then(res => res.json())
    .then(datos1 => {
        tabla(datos1)
    })
function tabla(datos1){
    const datos = datos1.values.filter(data =>{
        return data[1] ==='General Obligado';
    })
    const datosVera = datos1.values.filter(data =>{
        return data[1] ==='Vera';
    })
    const datos9jlio = datos1.values.filter(data =>{
      return data[1] ==='9 de Julio';
  })
/*Carga de gráficas y link de descarga dentro del popup Datos*/     
const canvas = document.getElementById('gra-panel-gan');
const canvas2 = document.getElementById('gra-panel-gan2');
const canvas3 = document.getElementById('gra-panel-gan3');
const ctx = canvas.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const ctx3 = canvas3.getContext('2d');

const configChart = {
  type: 'horizontalBar',
  data: {
     labels: datos.map(data =>{return data[0]}),
     datasets: [{
        label: 'Novillos ',
        data: datos.map(data =>{return data[4]}),
        borderColor:"rgba(236, 35, 35, 0.75)",
        backgroundColor: 'rgba(236, 35, 35,0.75)'
     },
     {
        label: 'Vacas ',
        data: datos.map(data =>{return data[2]}),
        borderColor:'rgba(35, 102, 236,0.75)',
        backgroundColor: 'rgba(35, 102, 236,0.5)'
     },
     {
        label: 'Toros ',
        data: datos.map(data =>{return data[8]}),
        borderColor:'rgb(35, 129, 20)',
        backgroundColor: 'rgba(35, 129, 20,1)'
     },
     {
        label: 'Vaquillonas ',
        data: datos.map(data =>{return data[3]}),
        borderColor:'rgba(81, 26, 132, 1)',
        backgroundColor: 'rgba(81, 26, 132, 0.792)'
     },
     {
        label: 'Novillitos ',
        data: datos.map(data =>{return data[5]}),
        borderColor:'rgba(58, 2, 25, 0.944)',
        backgroundColor: 'rgba(58, 2, 25, 0.944)'
     }  
    ]
  } 

 }
 const configChart2 = {
    type: 'bar',
    data: {
       labels: datosVera.map(data =>{return data[0]}),
       datasets: [{
          label: 'Novillos ',
          data: datosVera.map(data =>{return data[4]}),
          borderColor:"rgba(236, 35, 35, 0.75)",
          backgroundColor: 'rgba(236, 35, 35,0.75)'
       },
       {
          label: 'Vacas ',
          data: datosVera.map(data =>{return data[2]}),
          borderColor:'rgba(35, 102, 236,0.75)',
          backgroundColor: 'rgba(35, 102, 236,0.5)'
       },
       {
          label: 'Toros ',
          data: datosVera.map(data =>{return data[8]}),
          borderColor:'rgb(35, 129, 20)',
          backgroundColor: 'rgba(35, 129, 20,1)'
       },
       {
          label: 'Vaquillonas ',
          data: datosVera.map(data =>{return data[3]}),
          borderColor:'rgba(81, 26, 132, 1)',
          backgroundColor: 'rgba(81, 26, 132, 0.792)'
       },
       {
          label: 'Novillitos ',
          data: datosVera.map(data =>{return data[5]}),
          borderColor:'rgba(58, 2, 25, 0.944)',
          backgroundColor: 'rgba(58, 2, 25, 0.944)'
       }  
      ]
    } 
  
   }
   const configChart3 = {
      type: 'line',
      data: {
         labels: datos9jlio.map(data =>{return data[0]}),
         datasets: [{
            label: 'Novillos ',
            data: datos9jlio.map(data =>{return data[4]}),
            borderColor:"rgba(236, 35, 35, 0.75)",
            backgroundColor: 'rgba(236, 35, 35,0)'
         },
         {
            label: 'Vacas ',
            data: datos9jlio.map(data =>{return data[2]}),
            borderColor:'rgba(35, 102, 236,0.75)',
            backgroundColor: 'rgba(35, 102, 236,0)'
         },
         {
            label: 'Toros ',
            data: datos9jlio.map(data =>{return data[8]}),
            borderColor:'rgba(35, 129, 20,1)',
            backgroundColor: 'rgba(35, 129, 20,0)'
         },
         {
            label: 'Vaquillonas ',
            data: datos9jlio.map(data =>{return data[3]}),
            borderColor:'rgba(81, 26, 132, 1)',
            backgroundColor: 'rgba(81, 26, 132, 0)'
         },
         {
            label: 'Novillitos ',
            data: datos9jlio.map(data =>{return data[5]}),
            borderColor:'rgba(58, 2, 25, 0.944)',
            backgroundColor: 'rgba(58, 2, 25, 0)'
         }  
        ]
      } 
    
     }
 // añadir el gráfico y asignarle la clase active 
 myChart =  new Chart(ctx, configChart);
 // añadir el gráfico y asignarle la clase active 
 myChart2 =  new Chart(ctx2, configChart2);
 // añadir el gráfico y asignarle la clase active 
 myChart3 =  new Chart(ctx3, configChart3);
}
