const config = {
    user: 'mina77',
    password: 'Deen107*',
    server: 'DESKTOP-E4ASPST',
    database: 'moroccan_clothing_ecommerce',
    options: {
        encrypt: true, // This enables SSL/TLS
        trustServerCertificate: true,
        trustedconnection: true,
        // enableArithAort: true,
        instancename: 'SQLEXPRESS',
    },
    port: 1433
}

module.exports = config