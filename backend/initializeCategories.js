const Category = require('./models/Category');

const initializeCategories = async () => {
  const defaultCategories = [
    {
      key: 'katua',
      name: 'Katua',
      subcategories: [
        { name: 'Cotton Katua', link: '/category/katua/cotton' },
        { name: 'Embroidered Katua', link: '/category/katua/embroidered' },
        { name: 'Silk Katua', link: '/category/katua/silk' },
        { name: 'Printed Katua', link: '/category/katua/printed' },
        { name: 'Handloom Katua', link: '/category/katua/handloom' },
      ]
    },
    {
      key: 'panjabi',
      name: 'Panjabi',
      subcategories: [
        { name: 'Casual Panjabi', link: '/category/panjabi/casual' },
        { name: 'Formal Panjabi', link: '/category/panjabi/formal' },
        { name: 'Festival Panjabi', link: '/category/panjabi/festival' },
        { name: 'Embroidered Panjabi', link: '/category/panjabi/embroidered' },
        { name: 'Jamdani Panjabi', link: '/category/panjabi/jamdani' },
      ]
    },
    {
      key: 'polo',
      name: 'Polo',
      subcategories: [
        { name: 'Solid Color Polo', link: '/category/polo/solid' },
        { name: 'Striped Polo', link: '/category/polo/striped' },
        { name: 'Logo Embroidered Polo', link: '/category/polo/embroidered' },
        { name: 'Slim Fit Polo', link: '/category/polo/slim-fit' },
        { name: 'Long Sleeve Polo', link: '/category/polo/long-sleeve' },
      ]
    },
    {
      key: 'shirt',
      name: 'Shirt',
      subcategories: [
        { name: 'Formal Shirt', link: '/category/shirt/formal' },
        { name: 'Casual Shirt', link: '/category/shirt/casual' },
        { name: 'Check Shirt', link: '/category/shirt/check' },
        { name: 'Denim Shirt', link: '/category/shirt/denim' },
        { name: 'Linen Shirt', link: '/category/shirt/linen' },
      ]
    },
    {
      key: 'tshirts',
      name: 'T-shirts',
      subcategories: [
        { name: 'Graphic T-shirt', link: '/category/tshirts/graphic' },
        { name: 'Plain T-shirt', link: '/category/tshirts/plain' },
        { name: 'Oversized T-shirt', link: '/category/tshirts/oversized' },
        { name: 'V-Neck T-shirt', link: '/category/tshirts/v-neck' },
        { name: 'Full Sleeve T-shirt', link: '/category/tshirts/full-sleeve' },
      ]
    }
  ];

  for (const cat of defaultCategories) {
    try {
      const exists = await Category.findOne({ key: cat.key });
      if (!exists) {
        await new Category(cat).save();
        console.log(`Created category: ${cat.name}`);
      }
    } catch (err) {
      console.error(`Error initializing category ${cat.key}:`, err);
    }
  }
};

// Call this function when your server starts
initializeCategories();