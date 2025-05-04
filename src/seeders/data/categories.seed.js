/**
 * Category seed data
 */
module.exports = [
    {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        slug: 'electronics',
        level: 1,
        image: 'https://picsum.photos/400/400?random=201',
        active: true,
        featured: true,
        order: 1
    },
    {
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        slug: 'smartphones',
        parent: null, // Will be populated by parent ID
        level: 2,
        image: 'https://picsum.photos/400/400?random=202',
        active: true,
        order: 1
    },
    {
        name: 'Laptops',
        description: 'Portable computers for work and play',
        slug: 'laptops',
        parent: null, // Will be populated by parent ID
        level: 2,
        image: 'https://picsum.photos/400/400?random=203',
        active: true,
        order: 2
    },
    {
        name: 'Clothing',
        description: 'Apparel for men, women, and children',
        slug: 'clothing',
        level: 1,
        image: 'https://picsum.photos/400/400?random=204',
        active: true,
        featured: true,
        order: 2
    },
    {
        name: "Men's Clothing",
        description: 'Clothing for men',
        slug: 'mens-clothing',
        parent: null, // Will be populated by parent ID
        level: 2,
        image: 'https://picsum.photos/400/400?random=205',
        active: true,
        order: 1
    },
    {
        name: "Women's Clothing",
        description: 'Clothing for women',
        slug: 'womens-clothing',
        parent: null, // Will be populated by parent ID
        level: 2,
        image: 'https://picsum.photos/400/400?random=206',
        active: true,
        order: 2
    },
    {
        name: 'Home & Garden',
        description: 'Products for your home and garden',
        slug: 'home-garden',
        level: 1,
        image: 'https://picsum.photos/400/400?random=207',
        active: true,
        order: 3
    },
    {
        name: 'Furniture',
        description: 'Furnish your home with quality furniture',
        slug: 'furniture',
        parent: null, // Will be populated by parent ID
        level: 2,
        image: 'https://picsum.photos/400/400?random=208',
        active: true,
        order: 1
    },
    {
        name: 'Kitchen',
        description: 'Kitchen appliances and accessories',
        slug: 'kitchen',
        parent: null, // Will be populated by parent ID
        level: 2,
        image: 'https://picsum.photos/400/400?random=209',
        active: true,
        order: 2
    },
    {
        name: 'Toys & Games',
        description: 'Fun for all ages',
        slug: 'toys-games',
        level: 1,
        image: 'https://picsum.photos/400/400?random=210',
        active: true,
        order: 4
    }
];