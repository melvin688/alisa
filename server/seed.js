import { getDb } from './database.js';

const PRODUCTS = [
  {
    id: 'hayes-valley',
    name: 'Hayes Valley Espresso',
    name_zh: '海耶斯谷浓缩咖啡',
    description: 'Our signature dark espresso blend. Baking chocolate, orange zest, brown sugar.',
    description_zh: '我们的招牌深烘浓缩拼配。烘焙巧克力、橙皮、红糖风味。',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800',
    tags: ['Dark Roast', 'Signature'],
    tags_zh: ['深烘焙', '招牌'],
    notes: ['Baking Chocolate', 'Orange Zest', 'Brown Sugar'],
    notes_zh: ['烘焙巧克力', '橙皮', '红糖'],
    category: 'beans'
  },
  {
    id: 'tokyo-kissa',
    name: 'Tokyo Kissa',
    name_zh: '东京喫茶',
    description: 'Our darkest roast yet. Beautifully bittersweet and smoky.',
    description_zh: '我们最深的烘焙。美妙的苦甜和烟熏味。',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1587049488340-9a4f6696d00e?auto=format&fit=crop&q=80&w=800',
    tags: ['Extra Dark', 'Smoky'],
    tags_zh: ['极深烘焙', '烟熏'],
    notes: ['Bittersweet Cocoa', 'Toasted Marshmallow', 'Vanilla'],
    notes_zh: ['苦甜可可', '烤棉花糖', '香草'],
    category: 'beans'
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia Yirgacheffe',
    name_zh: '埃塞俄比亚 耶加雪菲',
    description: 'Bright and floral. Jasmine, bergamot, and lemon notes.',
    description_zh: '明亮且带有花香。茉莉花、佛手柑和柠檬的风味。',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1000',
    tags: ['Single Origin', 'Light Roast'],
    tags_zh: ['单一产地', '浅烘焙'],
    notes: ['Jasmine', 'Bergamot', 'Lemon'],
    notes_zh: ['茉莉花', '佛手柑', '柠檬'],
    category: 'beans'
  },
  {
    id: 'cold-brew',
    name: 'New Orleans Cold Brew',
    name_zh: '新奥尔良冷萃',
    description: 'Brewed with roasted chicory, sweetened with cane sugar.',
    description_zh: '加入烘焙菊苣萃取，搭配甘蔗糖浆。',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=1000',
    tags: ['Iced', 'Sweet'],
    tags_zh: ['冰饮', '甜'],
    notes: ['Chicory', 'Creamy', 'Sweet'],
    notes_zh: ['菊苣', '奶香', '甜'],
    category: 'drink'
  },
  {
    id: 'oat-latte',
    name: 'Oat Milk Latte',
    name_zh: '燕麦拿铁',
    description: 'Rich espresso balanced with creamy oat milk.',
    description_zh: '浓郁浓缩咖啡与绵密燕麦奶的完美平衡。',
    price: 7.00,
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=1000',
    tags: ['Hot', 'Dairy Free'],
    tags_zh: ['热饮', '无乳制品'],
    notes: ['Nutty', 'Smooth', 'Espresso'],
    notes_zh: ['坚果香', '顺滑', '浓缩咖啡'],
    category: 'drink'
  }
];

const LOCATIONS = [
  {
    name: "Mandalay - 63rd",
    name_zh: "曼德勒 - 63条",
    address: "63rd St, between 42nd & 43rd",
    address_zh: "63条, 42条与43条之间",
    hours: "09981249663",
    hours_zh: "09981249663",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000"
  },
  {
    name: "Mandalay - 59th",
    name_zh: "曼德勒 - 59条",
    address: "59th St, between 104th & 105th",
    address_zh: "59条, 104条与105条之间",
    hours: "09892455969",
    hours_zh: "09892455969",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000"
  },
  {
    name: "Mandalay - 56th",
    name_zh: "曼德勒 - 56条",
    address: "56th St, between 38th & 39th",
    address_zh: "56条, 38条与39条之间",
    hours: "09777738278",
    hours_zh: "09777738278",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000"
  }
];

export function seed() {
  const db = getDb();

  // Check if data already exists
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count > 0) {
    console.log('Database already seeded. Skipping...');
    return;
  }

  console.log('Seeding database...');

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, name_zh, description, description_zh, price, image, tags, tags_zh, notes, notes_zh, category)
    VALUES (@id, @name, @name_zh, @description, @description_zh, @price, @image, @tags, @tags_zh, @notes, @notes_zh, @category)
  `);

  const insertLocation = db.prepare(`
    INSERT INTO locations (name, name_zh, address, address_zh, hours, hours_zh, image)
    VALUES (@name, @name_zh, @address, @address_zh, @hours, @hours_zh, @image)
  `);

  const insertProducts = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run({
        ...p,
        tags: JSON.stringify(p.tags),
        tags_zh: JSON.stringify(p.tags_zh),
        notes: JSON.stringify(p.notes),
        notes_zh: JSON.stringify(p.notes_zh),
      });
    }
  });

  const insertLocations = db.transaction((locations) => {
    for (const loc of locations) {
      insertLocation.run(loc);
    }
  });

  insertProducts(PRODUCTS);
  insertLocations(LOCATIONS);

  console.log(`Seeded ${PRODUCTS.length} products and ${LOCATIONS.length} locations.`);
}
