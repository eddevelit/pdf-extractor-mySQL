let mysql = require ('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Edmysql6792.',
    database: 'bebbia_pdf_test',
    port: 3306
});

connection.connect(function(error){
    if(error){
        throw error;
    }else{
        console.log('Conexion correcta.');
    }
});

connection.query('SELECT * FROM Audiencias', function(error, result){
    if(error){
        throw error;
    }else{
        console.log(result);
    }
});

// Close the MySQL connection
connection.end(function(error){
    if(error){
        throw error;
    }else{
        console.log('Conexion finalizada.');
    }
});
