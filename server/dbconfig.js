const config = {
    user: 'ecom_app_user',
    password: 'Kafka851*',
    server: 'DESKTOP-E4ASPST',
    // database: 'ecommerce_16_5_2025',
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