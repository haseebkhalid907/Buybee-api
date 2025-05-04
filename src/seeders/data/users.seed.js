const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../../config/roles');

/**
 * Pre-hashed passwords for test users
 * In production, you'd never store passwords this way
 */
const hashedPassword = bcrypt.hashSync('Password123', 8); // Fixed password for test accounts

/**
 * User seed data - combined buyers, sellers, and admin
 */
module.exports = [
    // Admin user
    {
        name: 'Admin User',
        email: 'admin@buybee.com',
        password: hashedPassword,
        role: USER_ROLES.ADMIN,
        isEmailVerified: true,
        status: 'active',
        phone: '+12025550108', // Valid US phone number format
        addresses: [
            {
                name: 'Main Office',
                addressLine1: '123 Admin Street',
                city: 'Admin City',
                state: 'AC',
                country: 'USA',
                postalCode: '12345',
                isDefault: true,
                phone: '+12025550108'
            }
        ],
        preferences: {
            notifications: {
                email: true,
                push: true,
            },
            language: 'en',
            currency: 'USD',
        },
        profileImage: 'https://picsum.photos/400/400?random=101',
        lastLogin: new Date()
    },

    // Seller users
    {
        name: 'Tech Store',
        email: 'tech@buybee.com',
        password: hashedPassword,
        role: USER_ROLES.SELLER,
        isEmailVerified: true,
        status: 'active',
        phone: '+12025550109', // Valid US phone number format
        addresses: [
            {
                name: 'Store Location',
                addressLine1: '456 Tech Avenue',
                city: 'Silicon Valley',
                state: 'CA',
                country: 'USA',
                postalCode: '94025',
                isDefault: true,
                phone: '+12025550109'
            }
        ],
        sellerProfile: {
            storeName: 'Tech Gadgets Plus',
            storeDescription: 'Your one-stop shop for the latest tech gadgets and electronics.',
            storeImage: 'https://picsum.photos/800/600?random=102',
            businessAddress: {
                addressLine1: '456 Tech Avenue',
                city: 'Silicon Valley',
                state: 'CA',
                country: 'USA',
                postalCode: '94025',
            },
            businessPhone: '+12025550109',
            businessEmail: 'contact@techgadgetsplus.com',
            isVerified: true,
            rating: {
                average: 4.8,
                count: 152,
            },
            dateJoined: new Date('2023-01-15'),
            paymentInfo: {
                accountHolder: 'Tech Gadgets Inc',
                bankName: 'Silicon Bank',
            },
        },
        preferences: {
            notifications: {
                email: true,
                push: true,
                orderUpdates: true,
                marketing: false,
            },
            language: 'en',
            currency: 'USD',
        },
        profileImage: 'https://picsum.photos/400/400?random=103',
        lastLogin: new Date()
    },
    {
        name: 'Fashion Outlet',
        email: 'fashion@buybee.com',
        password: hashedPassword,
        role: USER_ROLES.SELLER,
        isEmailVerified: true,
        status: 'active',
        phone: '+12025550110', // Valid US phone number format
        addresses: [
            {
                name: 'Store Location',
                addressLine1: '789 Fashion Blvd',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                postalCode: '10001',
                isDefault: true,
                phone: '+12025550110'
            }
        ],
        sellerProfile: {
            storeName: 'Trendy Threads',
            storeDescription: 'Stay fashionable with our curated selection of clothing and accessories.',
            storeImage: 'https://picsum.photos/800/600?random=104',
            businessAddress: {
                addressLine1: '789 Fashion Blvd',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                postalCode: '10001',
            },
            businessPhone: '+12025550110',
            businessEmail: 'info@trendythreads.com',
            isVerified: true,
            rating: {
                average: 4.5,
                count: 89,
            },
            dateJoined: new Date('2023-02-20'),
            paymentInfo: {
                accountHolder: 'Trendy Threads LLC',
                bankName: 'Fashion Bank',
            },
        },
        preferences: {
            notifications: {
                email: true,
                push: false,
                orderUpdates: true,
                marketing: false,
            },
            language: 'en',
            currency: 'USD',
        },
        profileImage: 'https://picsum.photos/400/400?random=105',
        lastLogin: new Date()
    },
    {
        name: 'Home Decor',
        email: 'homedecor@buybee.com',
        password: hashedPassword,
        role: USER_ROLES.SELLER,
        isEmailVerified: true,
        status: 'active',
        phone: '+12025550111', // Valid US phone number format
        addresses: [
            {
                name: 'Store Location',
                addressLine1: '101 Decor Street',
                city: 'Chicago',
                state: 'IL',
                country: 'USA',
                postalCode: '60007',
                isDefault: true,
                phone: '+12025550111'
            }
        ],
        sellerProfile: {
            storeName: 'Home Sweet Home',
            storeDescription: 'Transform your living space with our beautiful home decor items.',
            storeImage: 'https://picsum.photos/800/600?random=106',
            businessAddress: {
                addressLine1: '101 Decor Street',
                city: 'Chicago',
                state: 'IL',
                country: 'USA',
                postalCode: '60007',
            },
            businessPhone: '+12025550111',
            businessEmail: 'sales@homesweethome.com',
            isVerified: true,
            rating: {
                average: 4.7,
                count: 120,
            },
            dateJoined: new Date('2023-03-05'),
            paymentInfo: {
                accountHolder: 'Home Sweet Home Decor',
                bankName: 'Decor Credit Union',
            },
        },
        preferences: {
            notifications: {
                email: true,
                push: true,
                orderUpdates: true,
                marketing: true,
            },
            language: 'en',
            currency: 'USD',
        },
        profileImage: 'https://picsum.photos/400/400?random=107',
        lastLogin: new Date()
    },

    // Buyer users
    {
        name: 'John Smith',
        email: 'john@example.com',
        password: hashedPassword,
        role: USER_ROLES.BUYER,
        isEmailVerified: true,
        status: 'active',
        phone: '+12025550112', // Valid US phone number format
        addresses: [
            {
                name: 'Home',
                addressLine1: '123 Main Street',
                city: 'Anytown',
                state: 'CA',
                country: 'USA',
                postalCode: '12345',
                isDefault: true,
                phone: '+12025550112'
            },
            {
                name: 'Work',
                addressLine1: '456 Office Blvd',
                city: 'Anytown',
                state: 'CA',
                country: 'USA',
                postalCode: '12345',
                isDefault: false,
                phone: '+12025550112'
            }
        ],
        preferences: {
            notifications: {
                email: true,
                push: true,
                orderUpdates: true,
                marketing: false,
            },
            language: 'en',
            currency: 'USD',
        },
        wishlist: [],
        cart: [],
        lastLogin: new Date('2025-05-01'), // Recent date
        profileImage: 'https://picsum.photos/400/400?random=108'
    },
    {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: hashedPassword,
        role: USER_ROLES.BUYER,
        isEmailVerified: true,
        status: 'active',
        phone: '+12025550113', // Valid US phone number format
        addresses: [
            {
                name: 'Apartment',
                addressLine1: '789 Apartment Building',
                addressLine2: 'Apt 42',
                city: 'Metropolis',
                state: 'NY',
                country: 'USA',
                postalCode: '54321',
                isDefault: true,
                phone: '+12025550113'
            }
        ],
        preferences: {
            notifications: {
                email: true,
                push: false,
                orderUpdates: true,
                marketing: true,
            },
            language: 'en',
            currency: 'USD',
        },
        wishlist: [],
        cart: [],
        lastLogin: new Date('2025-05-03'), // Recent date
        profileImage: 'https://picsum.photos/400/400?random=109'
    }
];