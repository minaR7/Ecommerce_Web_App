
const sql = require('mssql');
const config = require('./dbconfig');

async function createPagesTable() {
    try {
        let pool = await sql.connect(config);
        
        const query = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pages' and xtype='U')
            BEGIN
                CREATE TABLE pages (
                    page_id INT IDENTITY(1,1) PRIMARY KEY,
                    slug NVARCHAR(100) NOT NULL UNIQUE,
                    title NVARCHAR(255) NOT NULL,
                    content NVARCHAR(MAX),
                    updated_at DATETIME DEFAULT GETDATE()
                );
                
                INSERT INTO pages (slug, title, content) VALUES 
                ('conditions-of-sale', 'Conditions of Sale', 'Default content for Conditions of Sale...'),
                ('legal-notice', 'Legal Notice', 'Default content for Legal Notice...'),
                ('our-history', 'Our History', 'Default content for Our History...'),
                ('privacy-policy', 'Privacy Policy', 'Default content for Privacy Policy...');
                
                PRINT 'Pages table created and seeded successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Pages table already exists.';
            END
        `;
        
        await pool.request().query(query);
        console.log("Table creation script executed.");
        
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        sql.close();
    }
}

createPagesTable();
