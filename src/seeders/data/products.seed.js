/**
 * Product seed data
 * Note: category and seller will be populated by the seeder with actual MongoDB ObjectIds
 */
module.exports = [
    // Electronics - Smartphones
    {
        name: 'iPhone 13 Pro',
        description: 'Apple iPhone 13 Pro with 256GB storage and triple camera system.',
        price: 999.99,
        quantity: 50,
        categorySlug: 'smartphones', // Will be replaced with actual category ID in seeder
        sellerEmail: 'tech@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'iphone-13-pro',
        sku: 'APPLE-IP13P-256',
        images: [
            'https://picsum.photos/500/800?random=1',
            'https://picsum.photos/500/800?random=2'
        ],
        specifications: {
            brand: 'Apple',
            model: 'iPhone 13 Pro',
            storage: '256GB',
            color: 'Graphite',
            dimensions: '146.7 x 71.5 x 7.7 mm',
            weight: '204g',
            display: '6.1 inch Super Retina XDR OLED',
            camera: 'Triple 12MP camera system',
            battery: '3095 mAh',
            processor: 'A15 Bionic',
            os: 'iOS 15'
        },
        status: 'active',
        featured: true,
        condition: 'new',
        rating: {
            average: 4.8,
            count: 245
        },
        tags: ['smartphone', 'apple', 'ios', 'iphone', 'mobile phone'],
        reviewsData: [
            {
                userEmail: 'john@example.com',
                rating: 5,
                comment: 'Excellent phone with amazing camera quality. The battery life is impressive and Face ID works flawlessly.',
                date: new Date('2025-04-15')
            },
            {
                userEmail: 'jane@example.com',
                rating: 4,
                comment: 'Great phone overall. A bit expensive but worth the premium quality. The camera is exceptional in low light.',
                date: new Date('2025-04-10')
            },
            {
                userEmail: 'admin@buybee.com',
                rating: 5,
                comment: 'The best iPhone model to date. Apple has really outdone themselves with this one.',
                date: new Date('2025-04-05')
            },
            {
                userEmail: 'tech@buybee.com',
                rating: 5,
                comment: 'As a tech enthusiast, I can say this is the most complete smartphone package on the market.',
                date: new Date('2025-03-25')
            },
            {
                userEmail: 'fashion@buybee.com',
                rating: 5,
                comment: 'Not just functional but also a fashion statement. Love the premium design and feel.',
                date: new Date('2025-03-15')
            }
        ]
    },
    {
        name: 'Samsung Galaxy S21',
        description: 'Samsung Galaxy S21 with 128GB storage and triple camera system.',
        price: 799.99,
        quantity: 75,
        categorySlug: 'smartphones', // Will be replaced with actual category ID in seeder
        sellerEmail: 'tech@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'samsung-galaxy-s21',
        sku: 'SAMSUNG-GS21-128',
        images: [
            'https://picsum.photos/500/800?random=3',
            'https://picsum.photos/500/800?random=4'
        ],
        specifications: {
            brand: 'Samsung',
            model: 'Galaxy S21',
            storage: '128GB',
            color: 'Phantom Gray',
            dimensions: '151.7 x 71.2 x 7.9 mm',
            weight: '171g',
            display: '6.2 inch Dynamic AMOLED 2X',
            camera: 'Triple camera system',
            battery: '4000 mAh',
            processor: 'Exynos 2100',
            os: 'Android 11'
        },
        status: 'active',
        featured: true,
        condition: 'new',
        rating: {
            average: 4.6,
            count: 187
        },
        tags: ['smartphone', 'samsung', 'android', 'galaxy', 'mobile phone'],
        reviewsData: [
            {
                userEmail: 'john@example.com',
                rating: 5,
                comment: 'Great Android experience with excellent performance. Samsung\'s OneUI is much improved.',
                date: new Date('2025-04-12')
            },
            {
                userEmail: 'jane@example.com',
                rating: 4,
                comment: 'Solid phone with great features. The screen is gorgeous and the camera takes beautiful photos.',
                date: new Date('2025-04-08')
            },
            {
                userEmail: 'admin@buybee.com',
                rating: 5,
                comment: 'One of Samsung\'s best offerings. The integration with other Samsung products is seamless.',
                date: new Date('2025-03-30')
            },
            {
                userEmail: 'homedecor@buybee.com',
                rating: 4,
                comment: 'Really good phone that fits nicely in the hand. Great for everyday use.',
                date: new Date('2025-03-20')
            }
        ]
    },

    // Electronics - Laptops
    {
        name: 'MacBook Pro 14"',
        description: 'Apple MacBook Pro 14" with M1 Pro chip and 16GB unified memory.',
        price: 1999.99,
        quantity: 25,
        categorySlug: 'laptops', // Will be replaced with actual category ID in seeder
        sellerEmail: 'tech@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'macbook-pro-14',
        sku: 'APPLE-MBP14-16GB',
        images: [
            'https://picsum.photos/800/500?random=5',
            'https://picsum.photos/800/500?random=6'
        ],
        specifications: {
            brand: 'Apple',
            model: 'MacBook Pro 14"',
            processor: 'Apple M1 Pro',
            memory: '16GB unified memory',
            storage: '512GB SSD',
            display: '14.2-inch Liquid Retina XDR display',
            graphics: '16-core GPU',
            operatingSystem: 'macOS',
            battery: 'Up to 17 hours',
            weight: '3.5 pounds'
        },
        status: 'active',
        featured: true,
        condition: 'new',
        rating: {
            average: 4.9,
            count: 132
        },
        tags: ['laptop', 'apple', 'macbook', 'macbook pro', 'computer'],
        reviewsData: [
            {
                userEmail: 'john@example.com',
                rating: 5,
                comment: 'The M1 Pro is a game-changer. This laptop handles everything I throw at it with ease.',
                date: new Date('2025-04-16')
            },
            {
                userEmail: 'admin@buybee.com',
                rating: 5,
                comment: 'Perfect laptop for professionals. The screen is incredibly accurate for design work.',
                date: new Date('2025-04-01')
            },
            {
                userEmail: 'tech@buybee.com',
                rating: 4.7,
                comment: 'Remarkable performance and battery life. The best MacBook Pro in years.',
                date: new Date('2025-03-22')
            }
        ]
    },
    {
        name: 'Dell XPS 13',
        description: 'Dell XPS 13 with 11th Gen Intel Core i7 and 16GB RAM.',
        price: 1299.99,
        quantity: 30,
        categorySlug: 'laptops', // Will be replaced with actual category ID in seeder
        sellerEmail: 'tech@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'dell-xps-13',
        sku: 'DELL-XPS13-16GB',
        images: [
            'https://picsum.photos/800/500?random=7',
            'https://picsum.photos/800/500?random=8'
        ],
        specifications: {
            brand: 'Dell',
            model: 'XPS 13',
            processor: '11th Gen Intel Core i7-1185G7',
            memory: '16GB LPDDR4x',
            storage: '512GB SSD',
            display: '13.4-inch FHD+ InfinityEdge',
            graphics: 'Intel Iris Xe Graphics',
            operatingSystem: 'Windows 11',
            battery: 'Up to 14 hours',
            weight: '2.64 pounds'
        },
        status: 'active',
        featured: false,
        condition: 'new',
        rating: {
            average: 4.7,
            count: 98
        },
        tags: ['laptop', 'dell', 'xps', 'windows', 'computer'],
        reviewsData: [
            {
                userEmail: 'jane@example.com',
                rating: 5,
                comment: 'The best Windows laptop available. Compact yet powerful with an amazing screen.',
                date: new Date('2025-04-14')
            },
            {
                userEmail: 'tech@buybee.com',
                rating: 4,
                comment: 'Great build quality and performance. The InfinityEdge display is gorgeous.',
                date: new Date('2025-03-29')
            },
            {
                userEmail: 'admin@buybee.com',
                rating: 5,
                comment: 'Perfect balance of performance and portability. Excellent keyboard and trackpad.',
                date: new Date('2025-03-18')
            }
        ]
    },

    // Clothing - Men's
    {
        name: 'Classic Fit Oxford Shirt',
        description: 'Men\'s classic fit button-down oxford shirt in light blue.',
        price: 49.99,
        quantity: 100,
        categorySlug: 'mens-clothing', // Will be replaced with actual category ID in seeder
        sellerEmail: 'fashion@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'classic-fit-oxford-shirt',
        sku: 'MEN-SHIRT-OXBLU-M',
        images: [
            'https://picsum.photos/500/750?random=9',
            'https://picsum.photos/500/750?random=10'
        ],
        specifications: {
            brand: 'FashionBrand',
            gender: 'Men',
            type: 'Shirt',
            material: '100% Cotton',
            color: 'Light Blue',
            fit: 'Classic Fit',
            careInstructions: 'Machine wash cold, tumble dry low'
        },
        variants: [
            { size: 'S', quantity: 20 },
            { size: 'M', quantity: 30 },
            { size: 'L', quantity: 30 },
            { size: 'XL', quantity: 20 }
        ],
        status: 'active',
        featured: false,
        condition: 'new',
        rating: {
            average: 4.5,
            count: 78
        },
        tags: ['shirt', 'men', 'clothing', 'oxford', 'button-down'],
        reviewsData: [
            {
                userEmail: 'john@example.com',
                rating: 4,
                comment: 'Great quality shirt that fits well. The fabric is soft and comfortable.',
                date: new Date('2025-04-10')
            },
            {
                userEmail: 'admin@buybee.com',
                rating: 5,
                comment: 'Classic style that never goes out of fashion. Excellent craftsmanship.',
                date: new Date('2025-03-25')
            }
        ]
    },

    // Clothing - Women's
    {
        name: 'Floral Summer Dress',
        description: 'Women\'s floral print summer dress with A-line silhouette.',
        price: 59.99,
        quantity: 80,
        categorySlug: 'womens-clothing', // Will be replaced with actual category ID in seeder
        sellerEmail: 'fashion@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'floral-summer-dress',
        sku: 'WM-DRESS-FLORAL-M',
        images: [
            'https://picsum.photos/500/750?random=11',
            'https://picsum.photos/500/750?random=12'
        ],
        specifications: {
            brand: 'FashionBrand',
            gender: 'Women',
            type: 'Dress',
            material: '95% Cotton, 5% Elastane',
            color: 'Multicolor Floral',
            silhouette: 'A-line',
            length: 'Knee-length',
            careInstructions: 'Machine wash cold, line dry'
        },
        variants: [
            { size: 'XS', quantity: 15 },
            { size: 'S', quantity: 20 },
            { size: 'M', quantity: 25 },
            { size: 'L', quantity: 20 }
        ],
        status: 'active',
        featured: true,
        condition: 'new',
        rating: {
            average: 4.7,
            count: 134
        },
        tags: ['dress', 'women', 'clothing', 'summer', 'floral'],
        reviewsData: [
            {
                userEmail: 'jane@example.com',
                rating: 5,
                comment: 'Beautiful dress, perfect for summer events. The fabric is lightweight and breathable.',
                date: new Date('2025-04-05')
            },
            {
                userEmail: 'fashion@buybee.com',
                rating: 5,
                comment: 'The design is gorgeous and the fit is perfect. Will definitely buy more!',
                date: new Date('2025-03-28')
            },
            {
                userEmail: 'homedecor@buybee.com',
                rating: 4,
                comment: 'Lovely pattern and comfortable to wear. Sizing runs slightly large.',
                date: new Date('2025-03-15')
            }
        ]
    },

    // Home & Garden - Furniture
    {
        name: 'Mid-Century Modern Sofa',
        description: 'Three-seater mid-century modern sofa with tufted back cushions.',
        price: 899.99,
        quantity: 10,
        categorySlug: 'furniture', // Will be replaced with actual category ID in seeder
        sellerEmail: 'homedecor@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'mid-century-modern-sofa',
        sku: 'FURN-SOFA-MCM-3S',
        images: [
            'https://picsum.photos/800/600?random=13',
            'https://picsum.photos/800/600?random=14'
        ],
        specifications: {
            brand: 'HomeDecorBrand',
            type: 'Sofa',
            style: 'Mid-Century Modern',
            material: 'Wood frame, polyester upholstery',
            color: 'Gray',
            dimensions: '81" W x 33" D x 35" H',
            weight: '95 lbs',
            seating: '3-seater',
            assembly: 'Required'
        },
        status: 'active',
        featured: true,
        condition: 'new',
        rating: {
            average: 4.6,
            count: 42
        },
        tags: ['furniture', 'sofa', 'mid-century', 'modern', 'living room'],
        reviewsData: [
            {
                userEmail: 'jane@example.com',
                rating: 4,
                comment: 'Elegant design and comfortable. Assembly was straightforward with clear instructions.',
                date: new Date('2025-04-08')
            },
            {
                userEmail: 'homedecor@buybee.com',
                rating: 5,
                comment: 'Perfect centerpiece for my living room. The quality exceeds the price point.',
                date: new Date('2025-03-22')
            }
        ]
    },

    // Home & Garden - Kitchen
    {
        name: 'Stainless Steel Kitchen Knife Set',
        description: '5-piece stainless steel kitchen knife set with wooden block.',
        price: 129.99,
        quantity: 50,
        categorySlug: 'kitchen', // Will be replaced with actual category ID in seeder
        sellerEmail: 'homedecor@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'stainless-steel-knife-set',
        sku: 'KITCH-KNIFE-5PC',
        images: [
            'https://picsum.photos/700/500?random=15',
            'https://picsum.photos/700/500?random=16'
        ],
        specifications: {
            brand: 'KitchenBrand',
            pieces: '5-piece set',
            material: 'High-carbon stainless steel',
            handle: 'Pakkawood',
            includes: 'Chef knife, bread knife, utility knife, paring knife, wooden block',
            careInstructions: 'Hand wash recommended'
        },
        status: 'active',
        featured: false,
        condition: 'new',
        rating: {
            average: 4.8,
            count: 86
        },
        tags: ['kitchen', 'knives', 'knife set', 'stainless steel', 'cooking'],
        reviewsData: [
            {
                userEmail: 'john@example.com',
                rating: 5,
                comment: 'Professional quality knives at a reasonable price. They stay sharp for a long time.',
                date: new Date('2025-04-11')
            },
            {
                userEmail: 'homedecor@buybee.com',
                rating: 5,
                comment: 'Excellent balance and weight. The wooden block looks elegant on the counter.',
                date: new Date('2025-03-30')
            },
            {
                userEmail: 'admin@buybee.com',
                rating: 4,
                comment: 'Great set for home chefs. The knives cut through everything with ease.',
                date: new Date('2025-03-20')
            }
        ]
    },

    // Toys & Games
    {
        name: 'LEGO City Police Station',
        description: 'LEGO City Police Station building set with vehicles and minifigures.',
        price: 99.99,
        quantity: 35,
        categorySlug: 'toys-games', // Will be replaced with actual category ID in seeder
        sellerEmail: 'tech@buybee.com', // Will be replaced with actual seller ID in seeder
        slug: 'lego-city-police-station',
        sku: 'TOYS-LEGO-POLICE',
        images: [
            'https://picsum.photos/600/600?random=17',
            'https://picsum.photos/600/600?random=18'
        ],
        specifications: {
            brand: 'LEGO',
            ageRecommendation: '6+ years',
            pieceCount: '743 pieces',
            dimensions: '15" x 10" x 3"',
            includes: 'Police station, vehicles, and minifigures',
            theme: 'LEGO City'
        },
        status: 'active',
        featured: true,
        condition: 'new',
        rating: {
            average: 4.9,
            count: 112
        },
        tags: ['toys', 'lego', 'building sets', 'police', 'children'],
        reviewsData: [
            {
                userEmail: 'john@example.com',
                rating: 5,
                comment: 'My son loves this set! Hours of creative play and the details are amazing.',
                date: new Date('2025-04-09')
            },
            {
                userEmail: 'jane@example.com',
                rating: 5,
                comment: 'Great LEGO set with lots of play features. Instructions were clear and easy to follow.',
                date: new Date('2025-03-26')
            },
            {
                userEmail: 'tech@buybee.com',
                rating: 5,
                comment: 'Excellent build quality as always from LEGO. The vehicles and minifigures are top-notch.',
                date: new Date('2025-03-17')
            }
        ]
    }
];