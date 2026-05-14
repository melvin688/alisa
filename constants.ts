import { Product } from './types';

export const LOCAL_PRODUCTS: Product[] = [
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

export const LOCAL_LOCATIONS = [
  {
    id: 1,
    name: "Mandalay - 63rd",
    name_zh: "曼德勒 - 63条",
    address: "63rd St, between 42nd & 43rd",
    address_zh: "63条, 42条与43条之间",
    hours: "09981249663",
    hours_zh: "09981249663",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    name: "Mandalay - 59th",
    name_zh: "曼德勒 - 59条",
    address: "59th St, between 104th & 105th",
    address_zh: "59条, 104条与105条之间",
    hours: "09892455969",
    hours_zh: "09892455969",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    name: "Mandalay - 56th",
    name_zh: "曼德勒 - 56条",
    address: "56th St, between 38th & 39th",
    address_zh: "56条, 38条与39条之间",
    hours: "09777738278",
    hours_zh: "09777738278",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000"
  }
];

export const UI_TEXT = {
    en: {
        nav: {
            home: "HOME",
            shop: "SHOP",
            locations: "LOCATIONS",
            about: "ABOUT"
        },
        hero: {
            est: "Est. 2024 • Mandalay",
            title_prefix: "The Art of",
            title_suffix: "Goffee",
            desc: "Experience true quality. Where classic taste meets modern roasting.",
            cta: "Shop Beans"
        },
        home_intro: "We believe coffee is a ritual, a moment of luxury in the mundane. Our spaces and our beans reflect a commitment to quality.",
        products: {
            subtitle: "Our Offerings",
            title: "Fresh Roasts",
            addToCart: "Add to Cart",
            beans: "Coffee Beans",
            drinks: "Coffee Drinks"
        },
        cart: {
            title: "Shopping Cart",
            empty: "Your cart is currently empty.",
            subtotal: "Subtotal",
            checkout: "Checkout",
            remove: "Remove",
            shopNow: "Shop Now",
            nameLabel: "Name for Order",
            namePlaceholder: "e.g. Michael"
        },
        locations: {
            title: "Visit Us",
            subtitle: "Immersive experiences in every cup.",
            getDirections: "Get Directions"
        },
        footer: {
            desc: "A tribute to exceptional coffee. Crafting moments of joy in Mandalay.",
            navTitle: "Navigation",
            shopAll: "Shop All",
            subs: "Subscriptions",
            wholesale: "Wholesale",
            careers: "Careers",
            newsletterTitle: "Newsletter",
            newsletterDesc: "Join our list for early access.",
            emailPlaceholder: "Email Address",
            join: "Join",
            copyright: "© 2024 goffee coffee. All Rights Reserved."
        },
        concierge: {
            btn: "Ask the Concierge",
            title: "The Digital Concierge",
            placeholder: "Tell me your deepest desires... regarding caffeine.",
            inputPlaceholder: "e.g., I like sweet and creamy..."
        }
    },
    zh: {
        nav: {
            home: "首页",
            shop: "商店",
            locations: "门店",
            about: "关于"
        },
        hero: {
            est: "成立于 2024 • 曼德勒",
            title_prefix: "咖啡的",
            title_suffix: "艺术",
            desc: "体验真正的品质。当经典口味遇上现代烘焙工艺。",
            cta: "选购咖啡豆"
        },
        home_intro: "我们相信咖啡是一种仪式，是平凡生活中的奢华时刻。我们的空间和咖啡豆都体现了对品质的承诺。",
        products: {
            subtitle: "我们的产品",
            title: "新鲜烘焙",
            addToCart: "加入购物车",
            beans: "咖啡豆",
            drinks: "咖啡饮品"
        },
        cart: {
            title: "购物车",
            empty: "您的购物车是空的。",
            subtotal: "小计",
            checkout: "去结账",
            remove: "移除",
            shopNow: "去购物",
            nameLabel: "取单人姓名",
            namePlaceholder: "例如：迈克尔"
        },
        locations: {
            title: "访问我们",
            subtitle: "每一杯都是沉浸式体验。",
            getDirections: "获取路线"
        },
        footer: {
            desc: "致敬卓越咖啡。在曼德勒打造快乐时刻。",
            navTitle: "导航",
            shopAll: "选购全部",
            subs: "订阅服务",
            wholesale: "批发合作",
            careers: "招贤纳士",
            newsletterTitle: "订阅通讯",
            newsletterDesc: "加入列表，抢先获取资讯。",
            emailPlaceholder: "电子邮箱地址",
            join: "加入",
            copyright: "© 2024 goffee coffee. 版权所有。"
        },
        concierge: {
            btn: "咨询 AI 礼宾",
            title: "数字礼宾服务",
            placeholder: "告诉我您对咖啡的喜好...",
            inputPlaceholder: "例如：我喜欢浓郁的口感..."
        }
    }
}