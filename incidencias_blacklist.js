/**
 * El ejercicio consiste en leer un archivo CSV con una lista de ip's, las cuales han sido marcadas por alguna razon en especifico,
 * y las compara con una lista de nodos con sus correspondientes subnet (obtenidas a partir de una consulta a una api). 
 * A medida que las compara va sumando la cantidad de veces que sucede por nodo y luego escribe toda la info en un json (solo los nodos con incidencias).
 */

const fs = require('fs');
const csv = require('csv-parser');
const request = require('request');

const url = 'URL_API';

request(url, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }

    // Guardo la informacion de la consulta a la api en una variable, creando un arreglo de objetos de nodos con subnet
    var lista = body.data;
    // Agrego la propiedad total a cada objeto para contabilizar casos que se repitan; así c/objeto tendra name, subnet y total
    for (var i = 0; i < lista.length; i++) {
        lista[i].total = 0;
    }

    // Leo el archivo csv, una línea a la vez
    fs.createReadStream('./ip_blacklist.csv')
        .pipe(csv())
        .on('data', function (data) {
            
            try {
                // Divido cada ip en sus octetos:
                net = data.ip.split('.');

                for (var i = 0; i < lista.length; i++) {
                    // Si la subnet de la lista de nodos es igual al segundo octeto de la ip sumara 1 al nodo correspondiente
                    if (lista[i].subnet == net[1]) {
                        lista[i].total += 1;
                    }
                }
            }
            catch (error) {
                console.error(error)
            }
        })
        .on('end', function () {
            // Guardo en el json solo los nodos que tuvieron alguna incidencia:
            try {
                fs.writeFileSync('./lista.json', JSON.stringify(lista.filter(checkCases), null, 2));

                function checkCases(caso){                
                    if (caso.total>0){
                        return caso;
                    }                
                }
            } catch (error) {
                console.error(error)
            }
        });

});