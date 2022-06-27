var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();



var mysql = require('mysql');
const { exec } = require("child_process");



// connection configurations
var dbConn = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'support',
    database: 'bar',
    dialect: "mysql",
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'))

// default route
app.get('/', function (req, res) {
return res.send({ error: true, message: 'hello' })
});

// connect to database
dbConn.connect(); 
// Retrieve all users 

app.delete('/borrar-venta', function (req, res) {

    var ventaid = req.body;

    var ventas_sql = "DELETE FROM ventas WHERE VentaId = '${ventaid}'"

    var ventas_detalle_sql = "DELETE FROM ventasdetalle WHERE VentaId = '${ventaid}'"

    dbConn.query(ventas_sql, function (err, result) {
        if (!err){ 
            dbConn.query(ventas_detalle_sql, function (err, result) 
            {
                if(!err)
                {
                    res.send({ error: false, data: result, message: 'deleted' })
                }else
                {
                    res.send({ error: true, data: err, message: 'error during delete' })
                }
            });
        }else
        {
            res.send({ error: true, data: err, message: 'error during delete' })
        }
    });
});

app.post( '/crear-venta', function (req, res) {
    
    var list = req.body;
    //console.log(list);
    var total = 0;

    for(var i=0; i < list.length; i++){
        var product = list[i];

        //console.log(product.SubTotal);

        if(parseInt(product.Cantidad) > 1)
        {
            for(var j = 1;j <= parseInt(product.Cantidad); j++)
            {
                total = total + parseInt(product.SubTotal);
            }
        }else{
            total = total + parseInt(product.SubTotal);
        }


 
    }

    //console.log(Number.parseFloat(total).toFixed(2));


    dbConn.query("INSERT INTO ventas(Fecha, creadoPor,Condicion,Total, ClienteId, Estado, Pagado, AcoId, VendedorId) VALUES(?,?,?,?,?,?,?,?,?)",
    [
        new Date().toISOString().replace('T', ' ').substr(0, 11),
        1,
        `C`,
        total,
        1,
        "B",
        total,
        47,
        1
    ],
    
    (err, res, fields) => {
        if (err) {
            res.send({error: true, message: "Error during get"});
        }else{

            //console.log("Venta creada exitosamente: ", { id: res.insertId });

            for(var i = 0; i < list.length; i++)
            {
                var product = list[i];
                var subTotal = parseFloat(product.SubTotal);
                var j = 0;
                if(parseInt(product.Cantidad) > 1){
                    monto = subTotal;
                    subTotal = 0;

                    while(j<parseInt(product.Cantidad)){
                        subTotal = parseFloat(subTotal + monto);
                        j++;
                    }
                }

                dbConn.query("INSERT INTO ventasdetalle(VentaId, MercaderiaId, SubTotal, Cantidad, Pvu, costo, Canje, facturado) VALUES(?,?,?,?,?,?,?,?)",
                [
                    res.insertId,
                    parseInt(product.MercaderiaId),
                    subTotal,
                    parseInt(product.Cantidad),
                    parseFloat(product.SubTotal),
                    0.00,
                    0,
                    0,
                ], (err, res, fields) => {
                    if(err){
                        res.send({error: true, message: "Error during get"})
                    }
                    
                }

                )
            }
        }
        


    },);
    return res.send({ error: false, message: 'enviado' });
});

app.get('/grupos', function (req, res) {
    dbConn.query('SELECT * FROM grupos', function (error, results, fields) {
        if (error) {
            res.send({error: true, message: "Error during get"});
        }
       
        return res.send({ error: false, data: results, message: 'users list.' });
    });
});

app.get('/mercaderias', function (req, res) {
    dbConn.query('SELECT * FROM mercaderias', function (error, results, fields) {
        if (error) {
            res.send({error: true, message: "Error during get"});
            return console.log(error);
        }
       
        return res.send({ error: false, data: results, message: 'users list.' });
    });
});

app.get('/sabor', function (req, res) {
    dbConn.query('SELECT * FROM sabor', function ( error, results, fields){
        if(error){
            res.send({error: true, message: "Error during get"});
            console.log(error);
        }

        return res.send({err: false, data: results, message: 'user list.'});
    });
});

app.get('/mercaderiasabor', function (req, res) {
    dbConn.query('SELECT * FROM mercaderiasabor', function (error, results, fields) {
        if (error) {
            res.send({error: true, message: "Error during get"});
            return console.log(error);
        }
       
        return res.send({ error: false, data: results, message: 'mercaderiasabor list.' });
    });
});







var ip = require("ip");
// set port
app.listen('3000', ip.address() , function() { console.log( this._connectionKey ) });
module.exports = app;