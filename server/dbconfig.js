const config = {
    user: 'mina77',
    password: 'Deen107*',
    server: 'localhost',
    database: 'moroccan_clothing_ecommerce',
    options: {
        encrypt: true, // This enables SSL/TLS
        trustServerCertificate: true 
        // trustedconnection: true,
        // enableArithAort: true,
        // instancename: '.',
    },
    port: 1433
}

module.exports = config