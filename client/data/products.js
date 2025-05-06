// data/products.js
export const subcategories = [
    { key: 'djellaba', label: 'Djellaba', img: '/assets/men/djellaba-man.jpg.webp', items: 12 },
    { key: 'jabador', label: 'Jabador', img: '/assets/men/jabador-man.jpg.webp', items: 6 },
    { key: 'moroccan-thobe', label: 'Moroccan Thobe', img: '/assets/men/moroccan-thobes.jpg.webp', items: 7 },
    { key: 'accessories', label: 'Accessories', img: '/assets/men/barnous-homme.jpg.webp', items: 2 }
];

export const womenSubcategories = [
    { key: 'djellaba', label: 'Djellaba', img: '/assets/men/djellaba-man.jpg.webp', items: 12 },
    { key: 'jabador', label: 'Jabador', img: '/assets/men/jabador-man.jpg.webp', items: 6 },
    { key: 'moroccan-thobe', label: 'Moroccan Thobe', img: '/assets/men/moroccan-thobes.jpg.webp', items: 7 },
    { key: 'accessories', label: 'Accessories', img: '/assets/men/barnous-homme.jpg.webp', items: 2 }
];

export const categories = [
    { key: 'men', label: 'Men' },
    { key: 'women', label: 'Women' },
    { key: 'kids', label: 'Kids' },
    { key: 'accessories', label: 'Accessories' }
];

export const products = [
    {
        productId: 'd1',
        subcategory: 'djellaba',
        productName: 'Classic White Djellaba',
        productDescription: 'A beautifully crafted white djellaba made from premium cotton.',
        productReviews: ['Great quality!', 'Very comfortable.', 'Loved the fabric.'],
        productSizes: ['S', 'M', 'L', 'XL'],
        productColors: ['White', 'Black'],
        price: {
            S: 50,
            M: 55,
            L: 60,
            XL: 65
        },
        availability: {
            S: true,
            M: true,
            L: false,
            XL: true
        },
        image: '/assets/moroccan-thobes.jpg.webp',
        imgs: ['/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp'],
        rating: 4.4,
        reviewCount:'6,377',
        isStock: false,
    },
    {
        productId: 'd2',
        subcategory: 'djellaba',
        productName: 'Classic White Djellaba',
        productDescription: 'A beautifully crafted white djellaba made from premium cotton.',
        productReviews: ['Great quality!', 'Very comfortable.', 'Loved the fabric.'],
        productSizes: ['S', 'M', 'L', 'XL'],
        productColors: ['White', 'Black'],
        price: {
            S: 50,
            M: 55,
            L: 60,
            XL: 65
        },
        availability: {
            S: true,
            M: true,
            L: false,
            XL: true
        },
        image: '/assets/moroccan-thobes.jpg.webp',
        imgs: ['/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp'],
        rating: 3.4,
        reviewCount:'17',
        isStock: true,
    },
    {
        productId: 'd4',
        subcategory: 'djellaba',
        productName: 'Classic White Djellaba',
        productDescription: 'A beautifully crafted white djellaba made from premium cotton.',
        productReviews: ['Great quality!', 'Very comfortable.', 'Loved the fabric.'],
        productSizes: ['S', 'M', 'L', 'XL'],
        productColors: ['White', 'Black'],
        price: {
            S: 50,
            M: 55,
            L: 60,
            XL: 65
        },
        availability: {
            S: true,
            M: true,
            L: false,
            XL: true
        },
        image: '/assets/jabador-man.jpg.webp',
        imgs: ['/assets/jabador-man.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/jabador-white-and-gold-503x800.jpg', '/assets/moroccan-thobes.jpg.webp', '/assets/djellaba-man.jpg.webp'],
        rating: 4.1,
        reviewCount:'377',
        isStock: true,
    },
    {
        productId: 'd5',
        subcategory: 'djellaba',
        productName: 'Classic White Djellaba',
        productDescription: 'A beautifully crafted white djellaba made from premium cotton.',
        productReviews: ['Great quality!', 'Very comfortable.', 'Loved the fabric.'],
        productSizes: ['S', 'M', 'L', 'XL'],
        productColors: ['White', 'Black'],
        price: {
            S: 50,
            M: 55,
            L: 60,
            XL: 65
        },
        availability: {
            S: true,
            M: true,
            L: false,
            XL: true
        },
        image: '/assets/moroccan-thobes.jpg.webp',
        imgs: ['/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp'],
        rating: 4.4,
        reviewCount:'6,377',
        isStock: false,
    },
    {
        productId: 'd3',
        subcategory: 'djellaba',
        productName: 'Classic White Djellaba',
        productDescription: 'A beautifully crafted white djellaba made from premium cotton.',
        productReviews: ['Great quality!', 'Very comfortable.', 'Loved the fabric.'],
        productSizes: ['S', 'M', 'L', 'XL'],
        productColors: ['White', 'Black'],
        price: {
            S: 50,
            M: 55,
            L: 60,
            XL: 65
        },
        availability: {
            S: true,
            M: true,
            L: false,
            XL: true
        },
        image: '/assets/moroccan-thobes.jpg.webp',
        imgs: ['/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp', '/assets/moroccan-thobes.jpg.webp'],
        rating: 3.4,
        reviewCount:'17',
        isStock: true,
    },
    {
        productId: 'p2',
        subcategory: 'jabador',
        productName: 'Modern Jabador Set',
        productDescription: 'A modern jabador set perfect for weddings and occasions.',
        productReviews: ['Stylish and elegant.', 'Perfect fit!'],
        productSizes: ['M', 'L', 'XL'],
        productColors: ['Blue', 'Gray'],
        price: {
            M: 80,
            L: 85,
            XL: 90
        },
        availability: {
            M: true,
            L: false,
            XL: true
        },
        image: '/assets/moroccan-thobes.jpg.webp',
        imgs: ['/assets/moroccan-thobes.jpg.webp'],
        rating: 4.4,
        reviewCount:'6,377',
        isStock: true,
    },
    // Add more products similarly for Moroccan Thobe & Accessories
];

export const sampleProducts = [
  {
    isChoice: true,
    image: '/assets/djellaba-man.jpg.webp',
    alt: 'Black long sleeve V neck ruched bodycon mini party cocktail dress on a woman',
    colors: ['#000000', '#312e81', '#4b5563', '#064e3b', '#fef08a'],
    extraColors: 9,
    brand: 'GOBLES',
    title: "Women's Sexy Long Sleeve V Neck Ruched Bodycon Mini Party Cocktail Dress",
    rating: 4.4,
    reviews: '6,377',
    price: '29',
    priceDecimal: '99',
    oldPrice: null,
    delivery: '$10.48 delivery',
    deliveryDate: 'Thu, Jan 12',
  },
  {
    isChoice: false,
    image: '/assets/moroccan-thobes.jpg.webp',
    alt: 'Black long sleeve deep V-neck waist tie ruffle mini swing dress on a woman',
    colors: ['#000000', '#b91c1c', '#047857', '#4b5563', '#312e81'],
    extraColors: 31,
    brand: 'Cosonsen',
    title: "Women's Dress Deep V-Neck Long Sleeve Waist Tie Ruffle Mini Swing",
    rating: 4.2,
    reviews: '18,627',
    price: '39',
    priceDecimal: '99',
    oldPrice: '45.99',
    delivery: 'FREE delivery',
    deliveryDate: 'Fri, Jan 13',
  },
];