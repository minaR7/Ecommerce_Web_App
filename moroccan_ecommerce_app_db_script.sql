-- Create the database
CREATE DATABASE moroccan_clothing_ecommerce;

-- Switch to the created database
USE moroccan_clothing_ecommerce;
-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY IDENTITY(1,1), 
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(15),
    address NVARCHAR(255),
    is_admin BIT NOT NULL DEFAULT 0, -- 0 = Customer, 1 = Admin
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Categories Table
CREATE TABLE categories (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Subcategories Table
CREATE TABLE subcategories (
    subcategory_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Products Table
CREATE TABLE products (
    product_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    cover_img NVARCHAR(255), -- URL for main product image
    images NVARCHAR(MAX), -- JSON array or comma-separated list of image URLs
    category_id INT,
    subcategory_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(subcategory_id)
);

-- Reviews Table
CREATE TABLE reviews (
    review_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    product_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Orders Table
CREATE TABLE orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    total_amount DECIMAL(10, 2),
    status NVARCHAR(50) CHECK (status IN ('pending', 'completed', 'shipped', 'canceled')),
    payment_status NVARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Order Items Table
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Cart Items Table
CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    product_id INT,
    quantity INT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Wishlist Items Table
CREATE TABLE wishlist_items (
    wishlist_item_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    product_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    amount DECIMAL(10, 2),
    payment_method NVARCHAR(50), -- (e.g., 'stripe', 'paypal', 'credit_card')
    payment_status NVARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed')),
    transaction_id NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Billings Table
CREATE TABLE billings (
    billing_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    address_line1 NVARCHAR(255),
    address_line2 NVARCHAR(255),
    city NVARCHAR(100),
    state NVARCHAR(100),
    country NVARCHAR(100),
    postal_code NVARCHAR(20),
    phone NVARCHAR(15),
    email NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Shipping Table
CREATE TABLE shipping (
    shipping_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    address_line1 NVARCHAR(255),
    address_line2 NVARCHAR(255),
    city NVARCHAR(100),
    state NVARCHAR(100),
    country NVARCHAR(100),
    postal_code NVARCHAR(20),
    phone NVARCHAR(15),
    shipping_method NVARCHAR(50), -- e.g., 'standard', 'express'
    shipping_status NVARCHAR(50) CHECK (shipping_status IN ('pending', 'shipped', 'delivered', 'returned')),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);



-- USERS
INSERT INTO users (first_name, last_name, email, password, phone, address, is_admin, created_at, updated_at)
VALUES 
('John', 'Doe', 'admin@example.com', 'hashedpassword123', '1234567890', '123 Admin St', 1, GETDATE(), GETDATE()),
('Jane', 'Smith', 'customer@example.com', 'hashedpassword456', '0987654321', '456 Customer Rd', 0, GETDATE(), GETDATE());

-- CATEGORIES
INSERT INTO categories (name, description, created_at, updated_at)
VALUES 
('Men', 'Men clothing, footwear, and accessories', GETDATE(), GETDATE()),
('Women', 'Women clothing, footwear, and accessories', GETDATE(), GETDATE()),
('Boys', 'Kids clothing and accessories', GETDATE(), GETDATE()),
('Girls', 'Fashion accessories like bags, jewelry, and watches', GETDATE(), GETDATE());

-- SUBCATEGORIES
INSERT INTO subcategories (name, description, category_id, created_at, updated_at)
VALUES 
('Shirts', 'Men Shirts', 1, GETDATE(), GETDATE()),
('Pants', 'Men Pants', 1, GETDATE(), GETDATE()),
('Dresses', 'Women Dresses', 2, GETDATE(), GETDATE()),
('Shoes', 'Women Shoes', 2, GETDATE(), GETDATE()),
('Toys', 'Kids Toys', 3, GETDATE(), GETDATE()),
('Bags', 'Fashion Bags', 4, GETDATE(), GETDATE());

-- PRODUCTS
INSERT INTO products (name, description, price, stock_quantity, cover_img, images, category_id, subcategory_id, created_at, updated_at)
VALUES 
('Men Casual Shirt', 'A comfortable men casual shirt made of cotton.', 29.99, 100, 'shirt_cover.jpg', '[\"shirt_1.jpg\", \"shirt_2.jpg\"]', 1, 1, GETDATE(), GETDATE()),
('Women Dress', 'Elegant women dress for parties and formal occasions.', 49.99, 50, 'dress_cover.jpg', '[\"dress_1.jpg\", \"dress_2.jpg\"]', 2, 3, GETDATE(), GETDATE()),
('Kids Toy Car', 'Fun toy car for kids aged 3-5 years.', 19.99, 200, 'toy_car_cover.jpg', '[\"toy_car_1.jpg\", \"toy_car_2.jpg\"]', 3, 5, GETDATE(), GETDATE()),
('Leather Handbag', 'Stylish leather handbag for women.', 79.99, 30, 'handbag_cover.jpg', '[\"handbag_1.jpg\", \"handbag_2.jpg\"]', 4, 6, GETDATE(), GETDATE());

-- REVIEWS
INSERT INTO reviews (user_id, product_id, rating, review_text, created_at)
VALUES 
(8, 1, 5, 'Excellent quality shirt! Fits perfectly.', GETDATE()),
(8, 2, 4, 'Nice dress, but a bit too tight around the waist.', GETDATE());

-- ORDERS
INSERT INTO orders (user_id, total_amount, status, payment_status, created_at, updated_at)
VALUES 
(8, 79.98, 'completed', 'completed', GETDATE(), GETDATE()),
(8, 149.98, 'pending', 'pending', GETDATE(), GETDATE());

-- ORDER ITEMS
INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
VALUES 
(4, 4, 8, 29.99, GETDATE()),
(3, 8, 1, 49.99, GETDATE()),
(5, 7, 5, 56.54, GETDATE()),
(2, 2, 1, 200, GETDATE()),
(2, 1, 2, 129.99, GETDATE()),
(4, 3, 4, 99.99, GETDATE());

-- CART ITEMS
INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
VALUES 
(8, 1, 1, GETDATE(), GETDATE()),
(8, 3, 2, GETDATE(), GETDATE());

-- WISHLIST ITEMS
INSERT INTO wishlist_items (user_id, product_id, created_at)
VALUES 
(8, 2, GETDATE()),
(8, 4, GETDATE());

-- PAYMENTS
INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, created_at)
VALUES 
(3, 79.98, 'stripe', 'completed', 'txn_12345', GETDATE());

-- BILLINGS
INSERT INTO billings (order_id, address_line1, address_line2, city, state, country, postal_code, phone, email, created_at)
VALUES 
(2, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'customer1@example.com', GETDATE()),
(3, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'customer2@example.com', GETDATE()),
(4, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'guest1@example.com', GETDATE()),
(5, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'guest2@example.com', GETDATE());

-- SHIPPING
INSERT INTO shipping (order_id, address_line1, address_line2, city, state, country, postal_code, phone, shipping_method, shipping_status, created_at)
VALUES 
(2, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'standard', 'shipped', GETDATE()),
(3, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'standard', 'delivered', GETDATE()),
(4, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'standard', 'shipped', GETDATE()),
(5, '456 Customer Rd', NULL, 'New York', 'NY', 'USA', '10001', '0987654321', 'standard', 'pending', GETDATE());
