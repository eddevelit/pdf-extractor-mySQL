# Información 
Aplicación creada para procesar archivos PDF contenidos en una carpeta y extraer su 
información para después insertarla en una Base se datos MySql.

## Instrucciones

- Utilizar el comando `npm install` para instalar las dependencias del proyecto.
- En el archivo mysqlUtil.js configurar los datos de conexión a la base de datos.
```javascript
   const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'bdHost',
    user: 'dbUser',
    password: 'dbPassword',
    database: 'db',
    port: 3306
})
```
- Ejecutar el comando `node index --path <<path donde se enceuntran los archivos PDF>>` para iniciar la aplicación.
###### Nota: El parámetro `--path` es obligatorio ya que este determina donde se encuentran los archivos PDF  a procesar.
```
Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -p, --path     Path de la carpeta donde se encuentran los archivos PDF que se
                 quiren procesar, ejemplo: F:/Documents/PDF  [string] [required]

```
