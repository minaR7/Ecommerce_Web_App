IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pages')
BEGIN
    CREATE TABLE pages (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        slug NVARCHAR(255) NOT NULL UNIQUE,
        content NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM pages WHERE slug = 'conditions-of-sale')
BEGIN
    INSERT INTO pages (title, slug, content) VALUES ('Conditions Of Sale', 'conditions-of-sale', '<div class="bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-[#202836] rounded-md p-4 mb-4 mt-4 text-center"><p class="text-gray-700 text-lg">Please read these terms carefully before placing an order.</p></div><p>Content to be populated via Admin Panel.</p>');
END

IF NOT EXISTS (SELECT * FROM pages WHERE slug = 'legal-notice')
BEGIN
    INSERT INTO pages (title, slug, content) VALUES ('Legal Notice', 'legal-notice', '<p>The following information outlines ownership, usage policies, data processing, and legal obligations.</p>');
END

IF NOT EXISTS (SELECT * FROM pages WHERE slug = 'our-history')
BEGIN
    INSERT INTO pages (title, slug, content) VALUES ('Our History', 'our-history', '<p>Born from memories stitched in Morocco and dreams carried across the sea.</p>');
END

IF NOT EXISTS (SELECT * FROM pages WHERE slug = 'privacy-policy')
BEGIN
    INSERT INTO pages (title, slug, content) VALUES ('Privacy & Cookie Policy', 'privacy-policy', '<p>This policy explains how we collect, use, and protect your data.</p>');
END
