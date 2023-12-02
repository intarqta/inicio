/* eslint-disable no-undef */
/**
 * sidebar replacing popup
 */

// config map
let config = {
    minZoom: 7,
    maxZoom: 18,
  };
 
  // magnification with which the map will start
  const zoom = 18;
  // co-ordinates
  
  const lat = -60.45;
  const lng = -28.83;


var map = L.map('map').setView([-29.3,-60.5],8);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// ------------------------------------------------------------
// async function to get data from json
async function fetchData(url) {
    try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
    } catch (err) {
    console.error(err);
    }
}
  // --------------------------------------------------
// button to close sidebar
const buttonClose = document.querySelector(".close-button");
    
let featureGroups = [];
let groupBounds;
let latlngs = [];
// Genrar un marcador por cada pluviometro

fetchData('../static/Json/red.json')
  .then((data) => {

    // create markers width "marker-options-id"
    data.map((marker) => {
        featureGroups.push(
        L.marker(marker.properties.coords, {
            icon: L.icon({
            iconUrl:'../static/IMG/cloud_img.svg',
            iconSize:[40,47],
            // html: `${marker.properties.id}`,            
          }),
          "marker-options-id": marker.properties.id,
          "marker-options-lugar": marker.properties.Lugar,
        }).addTo(map)
        );
        // /*añadir los departamentos al mapa*/
        latlngs.push(marker.properties.coords);
      
    });
    L.geoJson(Departamentos,{
        fillOpacity:0,
        color:'#00ace9',
        weight: 3,
      }).addTo(map);  
    return data;
  }).then((data)=>{
    featureGroups.map((marker) => {
        marker.bindTooltip("<b>" + marker.bindTooltip().options["marker-options-lugar"] + "</b>", {
        interactive: true,
        permanent: false,
        fillopacity: 0.01,
        direction: 'top',
        className: 'popup',
       }).addTo(map);
    });
          // create feature group with markers
          groupBounds = new L.featureGroup(featureGroups);
  
          // fitBounds of feature group to map
          map.fitBounds(groupBounds.getBounds(), {
            padding: [50, 50],
          });
      
          // add event listener to markers to open sidebar
          groupBounds.on("click", function (e) {
            if (e.layer instanceof L.Marker) {
              showSidebarWidthText(e.layer.options["marker-options-id"]);
              //map.setView([e.layer._latlng.lat,e.layer._latlng.lng],14);
            }        
          });
      
          // add comment to sodebar depending on marker id
          function showSidebarWidthText(id) {
            data.filter((marker) => {
              if (marker.properties.id === id) {
                document.body.classList.add("active-sidebar");
                addContentToSidebar(marker);
              }
            });
          }

  })
//--------------------------------------------------
  // close when click esc
  document.addEventListener("keydown", function (event) {
    // close sidebar when press esc
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
  
  // close sidebar when click on close button
  buttonClose.addEventListener("click", () => {
    
    // close sidebar when click on close button
    closeSidebar();
    map.setView([-29.25 ,-60.45], 8);
  });
  
  
  // --------------------------------------------------
  // cerrar la ventana emergente izquierda
  
  function closeSidebar() {
    // remove class active-sidebar
    document.body.classList.remove("active-sidebar");
  
    // bounds map to default
    boundsMap();
    
  }
  // --------------------------------------------------
  // add content to sidebar
  const ContdataTable = document.getElementById("divContdataTable"); 
  var myChart;
  function addContentToSidebar(marker) {
    const { id, Lugar, coords } = marker;
    const smallInfo = Lugar !== undefined ? `<small>${Lugar}</small>` : "";
    fetch('https://sheets.googleapis.com/v4/spreadsheets/1awrrt2lEPwK-Y16boJWzRtW1INCDPqBpax6DsUAR26A/values/Hoja 1!C:F?key=AIzaSyBqSKs7DT9oDteBtU5-tgs5t3nxfciLFz0')
    .then(res => res.json())
    .then(datos => {
        tabla(datos.values)
    })
    
    function tabla(datos) {
      const datos2 = datos.filter(cien => {
        return cien[1] === marker.properties.Nombre;
      }) 

var max = datos2.reduce(function (valor1, valor2) { return new Date(valor1) > new Date(valor2) ? valor1 : valor2; });
      /* función que permite obtener los últimos valores del json*/
      Array.prototype.last = function(n){
        return this.slice(-n)
      };
      var max3 = datos2.last(5);
      //Acumulado del último año
      var añoActual = new Date().getFullYear().toString();
      var datosUltimos = datos2.filter(datosLluvia =>{
        return datosLluvia[2].substring(6,10) === añoActual;
      });
      
      let totalAño=0
      let numeros = datosUltimos.map(data =>{return Number(data[3])});
      numeros.forEach(function(a){totalAño += a;});
      // Acumulado mensual
      let totalMes = 0
      var mesActual = new Date().getMonth() + 1;
      let mesActualString = mesActual.toString();
      let ultimoMes = datosUltimos.filter(datosLluvia =>{
        return Number(datosLluvia[2].substring(3,5)).toString() === mesActualString;
      });

      let numerosMes = ultimoMes.map(data =>{return Number(data[3])});
      numerosMes.forEach(function(a){totalMes += a;});

      max3.forEach(data =>{       

    // create sidebar content
    const sidebarTemplate = `
      <article class="sidebar-content">
        <h3 class="titulo">${marker.properties.Lugar}</h3>
        <div class="marker-id">Lugar: ${marker.properties.Lugar}</div>
        <div class="marker-id2">Distrito: ${marker.properties.nam}</div>
        <div class="marker-id3">Departamento: ${marker.properties.Dep_nam}</div>
        <div class="marker-id4">Plúviometro: ${marker.properties.Tip_Plu}</div>
        <h2 class="marker-id5">Último registro</h2>
        <h3 class="marker-id6">Fecha: ${ max[2]}</h3>
        <h3 class="marker-id7">Lluvia: ${ max[3] + " mm"}</h3>
        <button type="button" id="botonPopupMasDatos" class="btn btn-info btn-sm btn-block dataModal botonPopupMasDatos" data-toggle="modal" data-target="#dataModal" >Mas Datos</button>     
        </article>
    `;
    
      
    // create sidebar content
    const addconttemplate = `
      <article class="sidebar-content">
        <div class="marker-id">Lugar: ${marker.properties.Lugar}</div>
        <div class="marker-id2">Distrito: ${marker.properties.nam}</div>
        <div class="marker-id3">Departamento: ${marker.properties.Dep_nam}</div>
        <div class="marker-id4">Plúviometro: ${marker.properties.Tip_Plu}</div>
        <div class="marker-id8">Acumulado mensual: ${totalMes + " mm"}</div>
        <div class="marker-id9">Acumulado anual: ${totalAño + " mm"}</div>
          <table class="tablaDatos">        
          <tbody class= "tableEncab">
            </tbody class="TablaCuerpo">
            <tbody class= "tableEncab">
            <tr class ="tableTr">
            <th class ="tableTh"> Fecha </th>
            ${max3.map((itm)=>{
              return `<td>${itm[2]}</td>`
            },'').join('')}</tr>
            <tr class ="tableTr">
            <th class ="tableTh"> Precipitación (mm) </th>
            ${max3.map((itm)=>{
              return `<td>${itm[3]}</td>`
            },'').join('')}</tr>
            
            </tbody>
        </table> 
      </article>
    `;
    const sidebar = document.querySelector(".sidebar");
    const sidebarContent = document.querySelector(".sidebar-content");

    // Agregar información para interpretar las capas
        overlay = document.getElementById('overlay'),
        popup = document.getElementById('popup-popup'),
        btnCerrarPopup = document.getElementById('btn-cerrar-popup');

    $(document).ready(function(){
      $(document).on('click',  '.botonPopupMasDatos',function(){
        overlay.classList.add('active');
        popup.classList.add('active');
        document.getElementById('botonpluv1').click();
      })
    })

     btnCerrarPopup.addEventListener('click', function(e){
       e.preventDefault();
       overlay.classList.remove('active');
       popup.classList.remove('active');
      canvas.classList.remove('active');
      /*Función que permite destruir el evento gráfico al cambiar de pestaña o cerrar el pupup */
      if(myChart){
        myChart.destroy();
      }
     });
    /*Carga de datos dentro del popup Pluviometro de mas datos*/
    const botonpluv = document.getElementById('botonpluv1');
    botonpluv.addEventListener('click', function(){
      const addContpopup = document.getElementById("divContdata");
      addContpopup.classList.remove('active');
      canvas.classList.remove('active');
      // always remove content before adding new one
      sidebarContent?.remove();
      document.getElementById("divContdata").innerHTML="";
      // add content to sidebar
      addContpopup.insertAdjacentHTML("beforeend", addconttemplate);
      // set bounds depending on marker coords
      boundsMap(coords);
    })
    
    // always remove content before adding new one
    sidebarContent?.remove();
    document.getElementById("contenido").innerHTML="";
    document.getElementById("divContdata").innerHTML="";
    // add content to sidebar
    sidebar.insertAdjacentHTML("beforeend", sidebarTemplate);
      
    // set bounds depending on marker coords
    boundsMap(coords);
  })
  /*Carga de gráficas y link de descarga dentro del popup Datos*/     
    const canvas = document.getElementById('chart-Bar');
    const ctx = canvas.getContext('2d');
    

    const configChart = {
      type: 'bar',
      data: {
         labels: datos2.map(data =>{return data[2]}),
         datasets: [{
            label: 'Lluvias '+ max[1],
            data: datos2.map(data =>{return data[3]}),
            backgroundColor: 'rgba(0, 119, 204, 0.5)'
         }]
      } 
    };
  const botondatos = document.getElementById('botonpluv')
   botondatos.addEventListener('click', function(){

    document.getElementById("divContdata").innerHTML="";

    const addContpopup = document.getElementById("divContdata");
    addContpopup.classList.add('active');
    document.getElementById("divContdata").innerHTML="";
    /*Función que permite destruir el evento gráfico al cambiar de pestaña o cerrar el pupup */
    if(myChart){
      myChart.destroy();
    }
      // añadir el gráfico y asignarle la clase active 
      myChart =  new Chart(ctx, configChart);
      canvas.classList.add('active');
   })
   /*Descargar los datos de cada plúviometro al hacer click en el botón*/
   const BotonDescarga = document.getElementById("botonDescarga");
   BotonDescarga.addEventListener('click', function (){
    var headDatos = Array(["Agencia","Establecimiento","Fecha","Precipitación"]).concat(datos2);
    console.log(headDatos)
    var csv = headDatos.map(function(d){
    return d.join();
    }).join('\n');
    var link = document.createElement("a");    
    link.id="lnkDwnldLnk";
    document.body.appendChild(link);
    blob = new Blob([csv], { type: "text/csv;charset=System;" }); 
    var csvUrl = window.webkitURL.createObjectURL(blob);
    var filename = 'DatosPluv_'+datos2[1][1]+'.csv';
    jQuery("#lnkDwnldLnk")
    .attr({
        'download': filename,
        'href': csvUrl
    });
    jQuery('#lnkDwnldLnk')[0].click();
    document.body.removeChild(link);
   })

  }
}

  // --------------------------------------------------
  // bounds map when sidebar is open
  function boundsMap(coords) {
    const sidebar = document.querySelector(".sidebar").offsetWidth;
  
    const marker = L.marker(coords);
    console.log(marker.latlngs)
    const group = L.featureGroup([marker]);
  
    // bounds depending on whether we have a marker or not
    const bounds = coords ? group.getBounds() : groupBounds.getBounds();
  
    // set bounds of map depending on sidebar
    // width and feature group bounds
    map.fitBounds(bounds, {
      paddingTopLeft: [coords ? sidebar :   400, 0],
    });    

  }


// Botón interactivo para más datos
const botonFiltroDatosAbrir = document.getElementById("botonFiltroDatosAbrir");
const botonFiltroDatosCerrar = document.getElementById("botonFiltroDatosCerrar");
const filtroDatos = document.getElementById("filtroDatos");
botonFiltroDatosAbrir.addEventListener('click', function(){
  botonFiltroDatosAbrir.classList.add('active')
  botonFiltroDatosCerrar.classList.add('active')
  filtroDatos.classList.add('active')

})
botonFiltroDatosCerrar.addEventListener('click', function(){
  botonFiltroDatosAbrir.classList.remove('active')
  botonFiltroDatosCerrar.classList.remove('active')
  filtroDatos.classList.remove('active')

})

// Botones de filtrado de datos
function populate(slct1, slct2) {
  var s1 = document.getElementById(slct1);
  var s2 = document.getElementById(slct2);
  s2.innerHTML = "";
  optionArray = [];
  // Extraer los datos de la base de datos
  fetch('https://sheets.googleapis.com/v4/spreadsheets/1awrrt2lEPwK-Y16boJWzRtW1INCDPqBpax6DsUAR26A/values/Hoja 1!C:F?key=AIzaSyBqSKs7DT9oDteBtU5-tgs5t3nxfciLFz0')
    .then(res => res.json())
    .then(datos => {
        tabla(datos.values)
    })
    function tabla(datos) {
    //  console.log(datos.map(data =>{return data[1]}))

    if (s1.value == "9 de Julio") {
      var optionArray = {"Comuna de Gato Colorado":["Comuna_de_Gato_Colorado"],
      "Comisaría Santa Margarita":["Comisaria_de_Sta_Margarita"],
      "Zona Rural de Gregoria Pérez de Denis (Pablo Miranda)":["Zona_rural_Gregorio_P_Denis"],
      "Est. El Patito":["Zona_rural_San_Bernardo"],
      "Comisaría Esteban Rams":["Comisaria_de_Esteban_Rams"],
      "Comisaría Logroño":["Comisaria_de_Logrono"],
      "Comisaría de Montefiore":["Comisaria_de_Montefiore"],
      "Min. Produc. V. Minetti":["Min_Prod_V_Minetti"],
      "Comisaría de Pozo Borrado":["Comisaria_de_P_Borrado"],
      "Est. Gerardo Mondino":["Establecimiento_Mondino"],
      "Est. La Güeya (Sr. Lahitte)":["La_Guella"],
      "Cuatro Bocas (Alfredo Andreu)":["Cuatro_Bocas"]
      };
  } else if (s1.value == "Vera") {
      var optionArray = {"Miguel Cancian":["Cancian"],
      "Mario Vicentin":["Vicentin"],
      "Cooperativa de Margarita":["Cooperativa_de_Margarita"],
      "Forestagro":["Forestagro"],
      "La invernada":["La_Invernada"],
      "Las Gamas":["Las_Gamas"],
      "El Guanagán":["La_Sombrilla"],
      "Est. La Virginia":["La_Virginia"],
      "Los Teritos":["Batistuta"],
      "Vicentin":["Sopere"],
      "Bressan":["Bressan"],
      "Chamorro":["Chamorro"]
    };
    console.log(optionArray)
  } else if (s1.value == "General Obligado") {
      var optionArray = {"Tacuarendí":["COET_Tacuarendi"],
      "Florencia":["Establecimiento_Forencia"],
      "El Rabón":["El_Rabon"],
      "Pje San Juan (Villa Guillermina)":["Pje_San_Juan"],
      "Zona rural de Villa Guillermina":["V_Guillermina"],
      "Las Toscas":["Las_Toscas"],
      "Las Toscas":["Las_Toscas"],
      "Zona rural Villa Adela":["Villa_Adela"],
      "Zona rural Villa Ana":["V_Ana"],
      "Zona rural Las Claritas":["Las_Claritas"],
      "Zona rural El Sombrerito":["El_Sombrerito"],
      "Avellaneda":["Avellaneda"],
      "Reconquista":["Coop_UAA_Reconquista"],
      "El Arazá":["Coop_UAA_El_Araza"],
      "La Sarita":["Coop_UAA_La_Sarita"],
      "El Timbó":["Coop_UAA_El_Timbo"],
      "Guadalupe Norte":["Coop_UAA_Guadalupe_Norte"],
      "Lanteri":["Coop_UAA_Lanteri"],
      "Complejo Los Lapachos":["Coop_UAA_Los_Lapachos"],
      "Aº Ceibal":["Coop_UAA_Ceibal"],
      "Malabrigo":["Malabrigo"],
      "San Manuel":["San_Manuel"],
      "Zona rural Paraje 3 Bocas":["Tres_Bocas"],
      "EEA Reconquista":["Las_Aminatas"]
      };
  } else if (s1.value == "San Javier") {
    var optionArray = {
    "Romang":["Coop_Malabrigo_Romang"],
    "Colonia  La Criolla":["Colonia_La_Criolla"],
    "Ferreira":["H_C_Alejandra"],
    "Cacique Araicaiquín":["Cque_Araicaiquin"],
    "La Brava":["La_Brava"],
    "Colonia Teresa":["Colonia_Teresa"],
    "Paraje Los Jacintos":["Los_Jacintos"],
    "Colonia San Roque":["Colonia_San_Roque"]
    };       
  }else if (s1.value == "San Javier") {
    var optionArray = {
    "Romang":["Coop_Malabrigo_Romang"],
    "Colonia  La Criolla":["Colonia_La_Criolla"],
    "Ferreira":["H_C_Alejandra"],
    "Cacique Araicaiquín":["Cque_Araicaiquin"],
    "La Brava":["La_Brava"],
    "Colonia Teresa":["Colonia_Teresa"],
    "Paraje Los Jacintos":["Los_Jacintos"],
    "Colonia San Roque":["Colonia_San_Roque"]
    };       
}

for (var option in Object.keys(optionArray)) {
  if (Object.keys(optionArray).hasOwnProperty(option)) {
      var pair = Object.keys(optionArray)[option];
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "checkbox-pluviometros"
      checkbox.name = "checkbox";
      checkbox.value = pair;
      s2.appendChild(checkbox);

      var label = document.createElement('label')
      label.id = "nombre-checkbox-pluviometros";
      label.htmlFor = pair;
      label.appendChild(document.createTextNode(pair));

      s2.appendChild(label);
      s2.appendChild(document.createElement("br"));         

    }
  }
  // Generamos los arrays para cargarlos los pluviométros chequeados
  delete listCheked;
  delete arrayAllCheked;
  
  var listCheked = new Array();
  var arrayAllCheked = new Array();


  const aplicarFiltroPluviometros = document.getElementById("boton-aplicar-filtro");
  // const botonGrafica = document.getElementById("boton-graficar");
  const botonDescargar = document.getElementById("boton-descargar");
  const botonReset = document.getElementById("boton-reset");
  aplicarFiltroPluviometros.addEventListener('click', function(){
    if($(s2.checkbox).is(':checked')){
    arrayAllCheked.length = [];
    listCheked.length = [];
    listCheked.destroy;
    arrayAllCheked.destroy;
    optionArray.destroy;
    // Modificar la clase de los botones gráfica y descarga
    // botonGrafica.classList.add('active');
    botonDescargar.classList.add('active')
    botonReset.classList.add('active')
    // Borrar los elementos de los arrays
    let valores = new Array();
    var checkboxes = s2.checkbox;
    valores.length = [];
    checkboxes.length = [];
    var arr = Object.keys(optionArray).map(function (key) {return [key, optionArray[key]];});

    for (var i=0; i < checkboxes.length; i++){
        if (checkboxes[i].checked){
            valores.push(checkboxes[i].value);
        }
    }
    // Compara ambos arrays para solo quedarse con un array cheked
      arr.forEach(data =>{
        valores.forEach(dat =>{
          if(data[0]==dat){
            //  Extrae de la base de datos, todos los eventos de precipitaciones para el / los 
            // pluviométros seleccionados
            arrayAllCheked.push(datos.filter(dat =>{
              return dat[1]==data[1][0];
             }))

          }
        })
     })
    //  Añade el lugar a cada evento de precipitación 
     for (var i=0; i < valores.length; i++){
     arrayAllCheked[i].map(k =>{
        k.push(valores[i])
      })
    }
      // // Generar Gráfico de lineas para cada pluviométro
      // const showObjet = document.getElementById("show");
      // const selectPluv = document.getElementById("pluviometro");
      // const showObjet1 = document.getElementById("show1");
      // const showObjet2 = document.getElementById("show2");
      // const graficoConfig = document.getElementById("grafica-config");
      // const graph = document.querySelector("#grafica");
      // const ctxchart = graph.getContext('2d');

      // botonGrafica.addEventListener('click', function(){
      //   if($(checkboxes).is(':checked')){
      //     s1.classList.add('active');
      //    s2.classList.add('active');
      //    showObjet.classList.add('active');
      //    showObjet1.classList.add('active');
      //    showObjet2.classList.add('active');
      //    graficoConfig.classList.add('active')
      //   //  generar una lista desplegable
      //   // con los pluviometros selecionados

      //   //  Generar una gráfica de columnas

      //   /*Carga de gráficas y link de descarga dentro del popup Datos*/

      // //    new Chart(ctxchart, config);
            
      
      //   for (var i=0; i < valores.length; i++){ 
      //     var selectPluviometro = document.createElement("option");
      //     selectPluviometro.innerHTML = valores[i];
      //     selectPluv.appendChild(selectPluviometro);
      //     selectPluv.appendChild(document.createElement("br"));
         
      //    }  
      //   // const canvasPrincipal = document.getElementById('grafico-pluviometros-cheked');
      //   // const ctxPrincipal = canvasPrincipal.getContext('2d');
      //   const configChartPrincipal = {
      //     type: 'bar',
      //     data: {
      //        labels: arrayAllCheked[i].map(data =>{return data[2]}),
      //        datasets: [{
      //           label: valores[i],
      //           data: arrayAllCheked[i].map(data =>{return data[3]}),
      //           borderColor:"rgba(236, 35, 35, 0.75)",
      //           backgroundColor: 'rgba(236, 35, 35,0.75)'
      //        } 
      //       ]
      //     } 
      //    }
      //   //  añadir el gráfico y asignarle la clase active 
      //    myChart =  new Chart(ctxchart, configChartPrincipal);
       
      //    /*Función que permite destruir el evento gráfico al cambiar de pestaña o cerrar el pupup */
      //   //  if(myChart){
      //   // myChart.destroy();
      //   // }
      //   }else{
      //     alert('Seleccione un pluviométro para gráficar!');
      //   }
        
      // })
      /*Descargar los datos de cada plúviometro al hacer click en el botón*/
     botonDescargar.addEventListener('click', function (){
      // Generar un solo arrays con todos los datos seleccionados
      var arrayVacioEj = new Array([]);
     arrayAllCheked.forEach(arrayData =>{
        return arrayVacioEj = arrayVacioEj.concat(arrayData)
     })
      // comprobar si algún pluviometro está
      if($(checkboxes).is(':checked')){
      var headDatos = Array(["Agencia","ID","Fecha","Precipitación", "Lugar"]).concat(arrayVacioEj);
      console.log(headDatos)
      // console.log(arrayVacioEj)
      var csv = headDatos.map(function(d){
      return d.join();
      }).join('\n');
      var link = document.createElement("a");    
      link.id="lnkDwnldLnk";
      document.body.appendChild(link);
      blob = new Blob([csv], { type: "text/csv;charset=System;" }); 
      var csvUrl = window.webkitURL.createObjectURL(blob);
      var filename = 'DatosPluviometricos'+'.csv';
      jQuery("#lnkDwnldLnk")
      .attr({
        'download': filename,
        'href': csvUrl
      });
      jQuery('#lnkDwnldLnk')[0].click();
      document.body.removeChild(link);
      
      } else{
        alert('Seleccione un pluviométro para descargar!');
      }

     })

     console.log(arrayAllCheked)
     console.log(listCheked)
     botonReset.addEventListener('click', function() {
      for (let i=0; i<checkboxes.length; i++) {
        // Vaciar los casilleros chequeados
          delete listCheked;
          delete arrayAllCheked;
          delete optionArray;
          delete s2;
          // for (let i = selectPluv.options.length; i >= 0; i--) {
          //   selectPluv.remove(i);
          // }
          valores.length = [];
          if(checkboxes[i].type == "checkbox") {
            checkboxes[i].checked = false
          }
      }
      s1.classList.remove('active');
      s2.classList.remove('active');
      botonDescargar.classList.remove('active')
      botonReset.classList.remove('active')
      // showObjet1.classList.remove('active');
      // showObjet2.classList.remove('active');
      // graficoConfig.classList.remove('active')
      /*Función que permite destruir el evento gráfico al cambiar de pestaña o cerrar el pupup */
    //   if(myChart){
    //     myChart.destroy();
    //   }
    })
  }else{
    alert('Seleccione un pluviométro para iniciar!');
  }
  })
  
 }
};