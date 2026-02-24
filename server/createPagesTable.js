
const sql = require('mssql');
const config = require('./dbconfig');

async function createPagesTable() {
    try {
        let pool = await sql.connect(config);
        
        const query = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pages' and xtype='U')
            BEGIN
                CREATE TABLE dbo.pages (
                    page_id INT IDENTITY(1,1) PRIMARY KEY,
                    slug NVARCHAR(100) NOT NULL UNIQUE,
                    title NVARCHAR(255) NOT NULL,
                    content NVARCHAR(MAX),
                    updated_at DATETIME DEFAULT GETDATE()
                );
            END

            IF NOT EXISTS (SELECT * FROM dbo.pages WHERE slug = 'conditions-of-sale')
                INSERT INTO dbo.pages (slug, title, content) VALUES ('conditions-of-sale', 'Conditions of Sale', 'Default content for Conditions of Sale...');
            
            IF NOT EXISTS (SELECT * FROM dbo.pages WHERE slug = 'legal-notice')
                INSERT INTO dbo.pages (slug, title, content) VALUES ('legal-notice', 'Legal Notice', 'Default content for Legal Notice...');
            
            IF NOT EXISTS (SELECT * FROM dbo.pages WHERE slug = 'our-history')
                INSERT INTO dbo.pages (slug, title, content) VALUES ('our-history', 'Our History', 'Default content for Our History...');
            
            IF NOT EXISTS (SELECT * FROM dbo.pages WHERE slug = 'privacy-policy')
                INSERT INTO dbo.pages (slug, title, content) VALUES ('privacy-policy', 'Privacy Policy', 'Default content for Privacy Policy...');

            IF NOT EXISTS (SELECT * FROM dbo.pages WHERE slug = 'delivery-time')
                INSERT INTO dbo.pages (slug, title, content) VALUES ('delivery-time', 'Delivery Time', 'Default content for Delivery Time...');

            IF NOT EXISTS (SELECT * FROM dbo.pages WHERE slug = 'exchange-return')
                INSERT INTO dbo.pages (slug, title, content) VALUES ('exchange-return', 'Exchange & Return', 'Default content for Exchange & Return...');

            IF NOT EXISTS (SELECT * FROM dbo.pages WHERE slug = 'payment-method')
                INSERT INTO dbo.pages (slug, title, content) VALUES ('payment-method', 'Payment Method', 'Default content for Payment Method...');
                
            PRINT 'Pages table check and seed completed.';
        `;
        
        await pool.request().query(query);
        console.log("Table creation script executed.", query);
        
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        sql.close();
    }
}

createPagesTable();
