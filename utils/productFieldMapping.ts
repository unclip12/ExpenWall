// Smart Dynamic Field Mapping for Indian Products
// This determines which fields to show based on product keywords

export interface ProductField {
  name: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
  unit?: string;
  required?: boolean;
}

export interface ProductFieldMapping {
  keywords: string[];
  category: string;
  fields: ProductField[];
}

export const INDIAN_PRODUCT_MAPPINGS: ProductFieldMapping[] = [
  // Soaps & Personal Care
  {
    keywords: ['soap', 'dove', 'lux', 'lifebuoy', 'dettol soap', 'pears', 'santoor', 'cinthol'],
    category: 'Personal Care - Soap',
    fields: [
      { name: 'brand', type: 'select', options: ['Dove', 'Lux', 'Lifebuoy', 'Dettol', 'Pears', 'Santoor', 'Cinthol', 'Hamam', 'Medimix', 'Other'], required: true },
      { name: 'variant', type: 'text', placeholder: 'e.g., White, Pink, Moisturizing' },
      { name: 'weight', type: 'number', unit: 'g', placeholder: '75, 125, 150', required: true },
      { name: 'quantity', type: 'number', placeholder: 'Number of bars', required: true },
      { name: 'mrp', type: 'number', unit: '₹', placeholder: 'Original price' },
      { name: 'price', type: 'number', unit: '₹', placeholder: 'Selling price', required: true },
    ]
  },

  // Shampoo & Conditioner
  {
    keywords: ['shampoo', 'conditioner', 'head shoulders', 'pantene', 'clinic plus', 'sunsilk', 'tresemme'],
    category: 'Personal Care - Hair Care',
    fields: [
      { name: 'brand', type: 'select', options: ['Pantene', 'Head & Shoulders', 'Clinic Plus', 'Sunsilk', 'TRESemmé', 'Dove', "L'Oreal", 'Other'], required: true },
      { name: 'variant', type: 'text', placeholder: 'e.g., Anti-Dandruff, Smooth & Silky' },
      { name: 'volume', type: 'number', unit: 'ml', placeholder: '200, 340, 650', required: true },
      { name: 'mrp', type: 'number', unit: '₹' },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Immersion Rod / Water Heater
  {
    keywords: ['immersion', 'rod', 'water heater', 'geyser rod', 'immersion heater'],
    category: 'Electronics - Water Heating',
    fields: [
      { name: 'brand', type: 'select', options: ['Bajaj', 'Usha', 'Crompton', 'Havells', 'V-Guard', 'Other'], required: true },
      { name: 'power', type: 'number', unit: 'W', placeholder: '1000, 1500, 2000', required: true },
      { name: 'platform', type: 'select', options: ['Amazon', 'Flipkart', 'Local Shop', 'Reliance Digital', 'Croma', 'Other'], required: true },
      { name: 'price', type: 'number', unit: '₹', required: true },
      { name: 'warranty', type: 'text', placeholder: 'e.g., 1 year, 2 years' },
    ]
  },

  // Tube Light / LED Bulbs
  {
    keywords: ['tube light', 'led', 'bulb', 'tubelight', 'cfl'],
    category: 'Electronics - Lighting',
    fields: [
      { name: 'brand', type: 'select', options: ['Philips', 'Bajaj', 'Syska', 'Wipro', 'Havells', 'Crompton', 'Other'], required: true },
      { name: 'power', type: 'number', unit: 'W', placeholder: '9, 12, 18, 20', required: true },
      { name: 'type', type: 'select', options: ['LED', 'CFL', 'Tube Light'], required: true },
      { name: 'color', type: 'select', options: ['Cool White', 'Warm White', 'Daylight', 'Yellow'] },
      { name: 'quantity', type: 'number', placeholder: 'Number of bulbs', required: true },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Shoes
  {
    keywords: ['shoe', 'shoes', 'sneaker', 'sandal', 'slipper', 'footwear', 'nike', 'adidas', 'puma', 'bata'],
    category: 'Fashion - Footwear',
    fields: [
      { name: 'brand', type: 'select', options: ['Nike', 'Adidas', 'Puma', 'Bata', 'Woodland', 'Red Tape', 'Skechers', 'Reebok', 'Other'], required: true },
      { name: 'type', type: 'select', options: ['Running Shoes', 'Sneakers', 'Formal', 'Sandals', 'Slippers', 'Sports'], required: true },
      { name: 'size', type: 'number', placeholder: 'UK Size (7, 8, 9...)', required: true },
      { name: 'color', type: 'text', placeholder: 'Black, White, Blue...' },
      { name: 'platform', type: 'select', options: ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Local Shop', 'Other'] },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Rice
  {
    keywords: ['rice', 'basmati', 'sona masoori', 'biryani rice', 'india gate'],
    category: 'Groceries - Staples',
    fields: [
      { name: 'brand', type: 'select', options: ['India Gate', 'Daawat', 'Kohinoor', 'Fortune', 'Aeroplane', 'Local', 'Other'], required: true },
      { name: 'type', type: 'select', options: ['Basmati', 'Sona Masoori', 'Kolam', 'Brown Rice', 'Other'], required: true },
      { name: 'weight', type: 'number', unit: 'kg', placeholder: '5, 10, 25', required: true },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Cooking Oil
  {
    keywords: ['oil', 'sunflower oil', 'mustard oil', 'groundnut oil', 'fortune oil', 'saffola'],
    category: 'Groceries - Cooking Oil',
    fields: [
      { name: 'brand', type: 'select', options: ['Fortune', 'Saffola', 'Sundrop', 'Gemini', 'Dhara', 'Dalda', 'Other'], required: true },
      { name: 'type', type: 'select', options: ['Sunflower', 'Mustard', 'Groundnut', 'Coconut', 'Palm', 'Rice Bran', 'Other'], required: true },
      { name: 'volume', type: 'number', unit: 'L', placeholder: '1, 2, 5', required: true },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Atta (Flour)
  {
    keywords: ['atta', 'flour', 'wheat flour', 'aashirvaad', 'pillsbury'],
    category: 'Groceries - Staples',
    fields: [
      { name: 'brand', type: 'select', options: ['Aashirvaad', 'Pillsbury', 'Fortune', 'Shakti Bhog', 'Annapurna', 'Local Chakki', 'Other'], required: true },
      { name: 'type', type: 'select', options: ['Whole Wheat', 'Multigrain', 'Maida', 'Other'] },
      { name: 'weight', type: 'number', unit: 'kg', placeholder: '5, 10', required: true },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Induction Cooktop
  {
    keywords: ['induction', 'cooktop', 'induction stove', 'prestige induction', 'philips induction'],
    category: 'Appliances - Cooking',
    fields: [
      { name: 'brand', type: 'select', options: ['Prestige', 'Philips', 'Bajaj', 'Butterfly', 'Pigeon', 'Havells', 'Other'], required: true },
      { name: 'power', type: 'number', unit: 'W', placeholder: '1200, 1800, 2000', required: true },
      { name: 'features', type: 'text', placeholder: 'Auto-off, Timer, Touch controls' },
      { name: 'platform', type: 'select', options: ['Amazon', 'Flipkart', 'Local Shop', 'Reliance Digital', 'Croma', 'Other'] },
      { name: 'price', type: 'number', unit: '₹', required: true },
      { name: 'warranty', type: 'text', placeholder: 'e.g., 1 year' },
    ]
  },

  // Cooker
  {
    keywords: ['cooker', 'pressure cooker', 'prestige cooker', 'hawkins'],
    category: 'Appliances - Cooking',
    fields: [
      { name: 'brand', type: 'select', options: ['Prestige', 'Hawkins', 'Pigeon', 'Butterfly', 'Wonderchef', 'Other'], required: true },
      { name: 'capacity', type: 'number', unit: 'L', placeholder: '2, 3, 5, 7', required: true },
      { name: 'type', type: 'select', options: ['Aluminium', 'Stainless Steel', 'Outer Lid', 'Inner Lid'] },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Air Cooler
  {
    keywords: ['cooler', 'air cooler', 'desert cooler', 'symphony', 'bajaj cooler'],
    category: 'Appliances - Cooling',
    fields: [
      { name: 'brand', type: 'select', options: ['Symphony', 'Bajaj', 'Crompton', 'Kenstar', 'Orient', 'Voltas', 'Other'], required: true },
      { name: 'capacity', type: 'number', unit: 'L', placeholder: 'Water tank capacity', required: true },
      { name: 'type', type: 'select', options: ['Desert', 'Personal', 'Tower', 'Window'], required: true },
      { name: 'platform', type: 'select', options: ['Amazon', 'Flipkart', 'Local Shop', 'Reliance Digital', 'Croma', 'Other'] },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Chips & Snacks (for Cravings)
  {
    keywords: ['chips', 'lays', 'kurkure', 'bingo', 'snack', 'namkeen'],
    category: 'Snacks',
    fields: [
      { name: 'brand', type: 'select', options: ['Lays', 'Kurkure', 'Bingo', 'Haldirams', 'Uncle Chips', 'Balaji', 'Other'], required: true },
      { name: 'flavor', type: 'text', placeholder: 'e.g., Magic Masala, Spanish Tomato', required: true },
      { name: 'weight', type: 'number', unit: 'g', placeholder: '20, 50, 90, 150', required: true },
      { name: 'quantity', type: 'number', placeholder: 'Number of packs', required: true },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Biryani (for Cravings)
  {
    keywords: ['biryani', 'biriyani', 'dum biryani'],
    category: 'Food - Biryani',
    fields: [
      { name: 'restaurant', type: 'text', placeholder: 'Restaurant name', required: true },
      { name: 'type', type: 'select', options: ['Chicken Biryani', 'Mutton Biryani', 'Veg Biryani', 'Egg Biryani', 'Paneer Biryani'], required: true },
      { name: 'quantity', type: 'select', options: ['Half', 'Full', 'Mini', 'Family Pack'], required: true },
      { name: 'platform', type: 'select', options: ['Swiggy', 'Zomato', 'Zepto', 'Dunzo', 'Restaurant Direct'], required: true },
      { name: 'price', type: 'number', unit: '₹', required: true },
    ]
  },

  // Default for unknown products
  {
    keywords: ['default'],
    category: 'General',
    fields: [
      { name: 'name', type: 'text', placeholder: 'Product name', required: true },
      { name: 'brand', type: 'text', placeholder: 'Brand (optional)' },
      { name: 'quantity', type: 'number', placeholder: 'Quantity', required: true },
      { name: 'price', type: 'number', unit: '₹', placeholder: 'Price', required: true },
      { name: 'platform', type: 'text', placeholder: 'Where to buy (optional)' },
    ]
  }
];

/**
 * Detects product type from keywords and returns appropriate field mapping
 */
export function detectProductFields(productName: string): ProductFieldMapping {
  const lowerName = productName.toLowerCase().trim();
  
  // Find matching product mapping
  for (const mapping of INDIAN_PRODUCT_MAPPINGS) {
    if (mapping.keywords.some(keyword => lowerName.includes(keyword))) {
      return mapping;
    }
  }
  
  // Return default if no match
  return INDIAN_PRODUCT_MAPPINGS[INDIAN_PRODUCT_MAPPINGS.length - 1];
}

/**
 * Extract product suggestions from common brands
 */
export function getProductSuggestions(input: string): string[] {
  const suggestions: string[] = [];
  const lowerInput = input.toLowerCase();
  
  INDIAN_PRODUCT_MAPPINGS.forEach(mapping => {
    mapping.keywords.forEach(keyword => {
      if (keyword.includes(lowerInput) && keyword !== 'default') {
        suggestions.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });
  });
  
  return [...new Set(suggestions)].slice(0, 5);
}