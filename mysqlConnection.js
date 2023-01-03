const ssh2 = require('ssh2');
const mysql = require('mysql2');

const sshClient = new ssh2.Client();

sshClient.connect({
  host: 'ec2-3-239-103-94.compute-1.amazonaws.com',
  port: 22,
  username: 'ec2-user',
  privateKey: require('fs').readFileSync('F:/Personal/Documents/Onikom/Rotoplas/Bebbia/info/info/bebbia-bastion/bebbia-bastion-dev.pem')
});

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'bebbia',
  password: 'BEPQWEKPW6Ddf6',
  database: 'bebbia'
});

sshClient.forwardOut(
  '127.0.0.1',
  3307,
  'ec2-3-239-103-94.compute-1.amazonaws.com',
  3306,
  (err, stream) => {
    if (err) throw err;
    connection.connect(stream);
  }
);

connection.query('SELECT * FROM wallet.card', (err, rows) => {
  if (err) throw err;
  console.log(rows);
});

// Connect to the database using the tunnel
connection.connect((error) => {  
  if (error) {
    throw error;
  }
  console.log('Connected to the database.');
});



