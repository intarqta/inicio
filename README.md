# Aplicación de fontagro

La aplicación consta de un backend desarrollado en python y un frontend desarrollo en React js

## Descripción de componentes 

### Backend

#### evaluate.py
Este componente permite obtener el valor de NDVI sentinel 2 para el rango de fecha solicitado por el usuario.
Se descarta las escenas con un porcentaje de nubes superior al 80. Ademas, se generó una funcion que evalua, mediante la banda de calidad MSK_MCDPROB, si dentro del polígono definido por el usuario hay más del 20% con nubes, descartando toda la fecha.
A continuación, se utiliza el polígono para conocer en que región fitgeografica el usuario digitalizó el polígono, devolviendo como dato esta información. Finalmente, el componente devuelve un json con los datos de ndvi y la region.
#### nasaPower.py
Este componente estrae las coordenadas del centroide del polígono, junto al rango de fecha definido por el usuario. Posteriormente, hace una petición get a Nasa Power para el rango de temperatura. Seguidamente, el código solicita los datos de radiación de los ultimos 10 años y genera el percentil 95 de cada dia juliano. Finalmente, se devuelve un json con los datos diarios de temperatura y radiación para el rando de fecha solicitado por el usuario.
#### Ajustes del servidor y despliegue 
El servidor recibe los datos en https://apigee-4ud9.onrender.com/api/ndvi/
