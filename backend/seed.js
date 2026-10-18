import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

export const seededProducts = [
  // --- ELECTRONICS (12 products) ---
  {
    name: "Studio Pro Wireless Headphones",
    description: "Precision engineered acoustics with adaptive active noise cancellation, transparency mode, and 40-hour ultra-low latency playback.",
    price: 14999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    stock: 24,
  },
  {
    name: "Mechanical Keychron Keyboard",
    description: "Custom hot-swappable mechanical switches, solid CNC-milled anodized aluminum chassis, and wireless multi-device pairing.",
    price: 6499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    stock: 18,
  },
  {
    name: "Minimalist Ergonomic Mouse",
    description: "Sculpted silent-click optical mouse with precision DPI thumb scroll wheel and textured palm grip for all-day creative work.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    stock: 35,
  },
  {
    name: "Ultra HD 4K IPS Creative Display",
    description: "27-inch factory-calibrated color accurate panel with 99% DCI-P3 gamut, HDR600, USB-C 90W single-cable power delivery.",
    price: 28999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    stock: 10,
  },
  {
    name: "Aluminum MagSafe Charging Stand",
    description: "Minimalist aircraft-grade aluminum dual stand with fast wireless charging for phone, smartwatch, and audio earbuds.",
    price: 2499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1622445262464-84b14e0745b1?w=800&auto=format&fit=crop&q=80",
    stock: 45,
  },
  {
    name: "Lossless Smart Speaker",
    description: "High-fidelity spatial audio speaker with room-sensing acoustic tuning, woven fabric exterior, and airplay integration.",
    price: 8999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    stock: 15,
  },
  {
    name: "Heritage Mirrorless Camera",
    description: "Classic tactile rangefinder aesthetics with modern 26MP APS-C sensor, film simulations, and high-precision prime lens kit.",
    price: 64999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    stock: 6,
  },
  {
    name: "Anodized Aluminum USB-C Hub",
    description: "Slim 7-in-1 expansion dock featuring 4K 60Hz HDMI, UHS-II card reader, and 100W Power Delivery pass-through.",
    price: 2199,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?w=800&auto=format&fit=crop&q=80",
    stock: 50,
  },
  {
    name: "Noise-Isolating Earbuds Pro",
    description: "Ultra-compact true wireless in-ear monitors with custom dynamic drivers, IPX5 sweat resistance, and Qi charging case.",
    price: 5999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    stock: 30,
  },
  {
    name: "Leather Smartwatch Series X",
    description: "Sapphire glass AMOLED smartwatch with ECG biometric monitoring, always-on display, and Italian full-grain leather band.",
    price: 12499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    stock: 22,
  },
  {
    name: "Retro Wooden Turntable",
    description: "Belt-driven two-speed vinyl record player with built-in stereo preamp, carbon fiber tonearm, and Bluetooth transmitter.",
    price: 11499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80",
    stock: 8,
  },
  {
    name: "Portable Power Bank 20000mAh",
    description: "Anodized space-gray power reserve with 65W fast laptop charging, digital percentage display, and multi-port safety.",
    price: 3299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1609592424368-e5659fb264f3?w=800&auto=format&fit=crop&q=80",
    stock: 40,
  },

  // --- FASHION (11 products) ---
  {
    name: "Heavyweight Boxy Cotton Tee",
    description: "Crafted from 280 GSM sustainably sourced organic combed cotton with a structured relaxed silhouette and reinforced collar.",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    stock: 45,
  },
  {
    name: "Selvedge Raw Denim Jacket",
    description: "Classic vintage trucker jacket woven on heritage shuttle looms from 14oz Japanese red-line selvedge denim.",
    price: 4999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    stock: 14,
  },
  {
    name: "Merino Wool Knit Sweater",
    description: "Luxuriously soft extrafine Australian merino wool pullover engineered for thermal breathability and lightweight layering.",
    price: 3899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
    stock: 20,
  },
  {
    name: "Minimalist Leather Weekender Duffel",
    description: "Full-grain vegetable-tanned cowhide travel bag with water-resistant cotton twill lining and solid brass hardware.",
    price: 7999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    stock: 12,
  },
  {
    name: "Architectural Trench Coat",
    description: "Tailored water-repellent gabardine storm coat with clean notched lapels, horn buttons, and a removable waist belt.",
    price: 8499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce667823?w=800&auto=format&fit=crop&q=80",
    stock: 9,
  },
  {
    name: "Classic Chronograph Watch",
    description: "Bauhaus-inspired clean dress watch with Swiss quartz movement, surgical-grade stainless steel case, and quick-release strap.",
    price: 5499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
    stock: 25,
  },
  {
    name: "City Commuter Everyday Backpack",
    description: "Weatherproof 1000D Cordura daypack with dedicated 16-inch suspended laptop sleeve, hidden passport pocket, and magnetic clasps.",
    price: 3999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80",
    stock: 28,
  },
  {
    name: "Handcrafted Chelsea Boots",
    description: "Blake-stitched Italian calfskin leather ankle boots featuring elasticated side gussets and Goodyear non-slip rubber soles.",
    price: 6999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80",
    stock: 16,
  },
  {
    name: "Polarized Acetate Sunglasses",
    description: "Handcrafted Italian tortoiseshell acetate frames equipped with Category 3 scratch-resistant polarized CR-39 lenses.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    stock: 32,
  },
  {
    name: "Linen Relaxed Resort Shirt",
    description: "Washed French flax linen short-sleeve camp shirt offering breezy comfort, natural drape, and casual sophistication.",
    price: 1999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    stock: 30,
  },
  {
    name: "Cashmere Ribbed Beanie",
    description: "Pure Mongolian cashmere knitted ribbed cuff hat providing weightless warmth and refined cold-weather luxury.",
    price: 1499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80",
    stock: 40,
  },

  // --- HOME & LIVING (11 products) ---
  {
    name: "Ceramic Artisan Pour-Over Set",
    description: "Hand-thrown speckled stoneware dripper with heat-resistant borosilicate glass server and walnut handle.",
    price: 2199,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    stock: 18,
  },
  {
    name: "Ergonomic Mesh Task Chair",
    description: "Precision lumbar support, breathable self-regulating mesh weave, 4D adjustable armrests, and pneumatic lift.",
    price: 11999,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1580481077195-c9a5840d5884?w=800&auto=format&fit=crop&q=80",
    stock: 8,
  },
  {
    name: "Matte Black Sculptural Desk Lamp",
    description: "Precision-machined counterbalanced task lamp with touch-capacitive dimming and 3000K warm neutral illumination.",
    price: 2799,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    stock: 22,
  },
  {
    name: "Solid Oak Floating Shelf",
    description: "Sustainably harvested white oak timber featuring concealed heavy-gauge mounting brackets and natural oil wax finish.",
    price: 1899,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&auto=format&fit=crop&q=80",
    stock: 25,
  },
  {
    name: "Soy Wax Amber Jar Candle",
    description: "Hand-poured 100% natural botanical soy wax candle featuring notes of sandalwood, cedarwood, and smoky amber.",
    price: 899,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80",
    stock: 50,
  },
  {
    name: "Washed Belgian Linen Duvet Cover",
    description: "Pre-washed breathable flax linen bedding set that grows softer with every wash, complete with hidden button closures.",
    price: 5499,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    stock: 14,
  },
  {
    name: "Ceramic Fluted Flower Vase",
    description: "Sculptural stoneware accent vase featuring vertical fluted ribbed textures and a tactile unglazed chalk exterior.",
    price: 1299,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80",
    stock: 35,
  },
  {
    name: "Handwoven Jute Textured Rug",
    description: "Natural golden biodegradable jute fibers hand-braided by master artisans for tactile warmth and organic grounding.",
    price: 4499,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop&q=80",
    stock: 11,
  },
  {
    name: "Cast Iron Enameled Dutch Oven",
    description: "Heavy-duty 5.5-quart heat-retentive enameled cast iron pot with tight-fitting lid for slow simmering and crusty bread baking.",
    price: 4999,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1584990347449-399b1a5e1e1d?w=800&auto=format&fit=crop&q=80",
    stock: 12,
  },
  {
    name: "Glass Cold Brew Pitcher",
    description: "1-liter borosilicate glass infusion maker with fine mesh stainless steel core and silicone leakproof pour spout.",
    price: 1499,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
    stock: 28,
  },
  {
    name: "Minimalist Wall Clock",
    description: "Quiet sweep non-ticking quartz movement encased in brushed brass with a crisp architectural off-white dial face.",
    price: 1799,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80",
    stock: 20,
  },

  // --- BOOKS (6 products) ---
  {
    name: "Designing Data-Intensive Applications",
    description: "The definitive guide to distributed databases, consensus, batch processing, and reliable architectures by Martin Kleppmann.",
    price: 1499,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&auto=format&fit=crop&q=80",
    stock: 35,
  },
  {
    name: "Clean Code: A Handbook of Software Craftsmanship",
    description: "Legendary programming principles by Robert C. Martin on readability, meaningful naming, refactoring, and test-driven design.",
    price: 999,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    stock: 45,
  },
  {
    name: "The Design of Everyday Things",
    description: "Don Norman's timeless cognitive science masterpiece exploring affordances, signifiers, and human-centered design psychology.",
    price: 849,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80",
    stock: 28,
  },
  {
    name: "Atomic Habits: Proven Framework",
    description: "James Clear's practical behavioral roadmap on how tiny incremental changes compound into transformative personal systems.",
    price: 749,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
    stock: 60,
  },
  {
    name: "The Architecture of Happiness",
    description: "Alain de Botton's philosophical exploration into how spaces, materials, and built environments shape our feelings and well-being.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    stock: 22,
  },
  {
    name: "Steal Like an Artist",
    description: "Austin Kleon's vibrant illustrated manifesto on authentic creativity, influence, creative curation, and artistic discovery.",
    price: 649,
    category: "Books",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&auto=format&fit=crop&q=80",
    stock: 40,
  },

  // --- WELLNESS & BEAUTY (6 products) ---
  {
    name: "Botanical Face Hydrating Oil",
    description: "Cold-pressed rosehip seed, jojoba, and squalane restorative facial elixir rich in essential omega fatty acids.",
    price: 1899,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1608248597359-561353f86e33?w=800&auto=format&fit=crop&q=80",
    stock: 30,
  },
  {
    name: "Rose Quartz Facial Gua Sha",
    description: "Hand-carved natural Brazilian rose quartz stone tool designed to encourage lymphatic drainage and relieve muscle tension.",
    price: 899,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&auto=format&fit=crop&q=80",
    stock: 42,
  },
  {
    name: "Organic Bamboo Matcha Whisk Set",
    description: "Traditional 100-prong golden bamboo chasen with handcrafted ceramic matcha bowl and carved bamboo measuring scoop.",
    price: 1499,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    stock: 24,
  },
  {
    name: "Natural Cedarwood Exfoliating Bar",
    description: "Small-batch cold-processed botanical bath bar formulated with ground oats, shea butter, and essential cypress oils.",
    price: 499,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1607006314644-d89f81643666?w=800&auto=format&fit=crop&q=80",
    stock: 75,
  },
  {
    name: "Ultrasonic Essential Oil Diffuser",
    description: "Whisper-quiet ceramic stoneware diffuser with subtle ambient LED ring and dual mist modes for continuous aromatherapy.",
    price: 2499,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
    stock: 20,
  },
  {
    name: "Thermal Stainless Water Bottle 750ml",
    description: "Double-wall vacuum insulated canteen engineered to keep drinks chilled for 24 hours or steaming hot for 12 hours.",
    price: 1299,
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    stock: 38,
  },

  // --- WORKSPACE & ACCESSORIES (6 products) ---
  {
    name: "Felt & Vegan Leather Desk Pad",
    description: "Large 900x400mm reversible dual-surface desk mat with plush merino wool felt backing and water-resistant leather top.",
    price: 1499,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1585792180666-f7547c6a28c5?w=800&auto=format&fit=crop&q=80",
    stock: 35,
  },
  {
    name: "Solid Brass Fountain Pen",
    description: "Precision-weighted raw untreated solid brass writing instrument fitted with a fine German iridium nib that patinas gracefully.",
    price: 2899,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80",
    stock: 22,
  },
  {
    name: "Hardcover Dot-Grid Notebook",
    description: "Clothbound Smyth-sewn journal featuring 120gsm ink-proof fountain pen friendly archival paper and dual ribbon bookmarks.",
    price: 799,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    stock: 55,
  },
  {
    name: "Walnut Laptop Riser Stand",
    description: "Sculpted bentwood American walnut laptop perch designed to elevate displays to natural ergonomic eye-level posture.",
    price: 2499,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    stock: 19,
  },
  {
    name: "Magnetic Cable Organizer Pod",
    description: "Weighted silicone desk anchor with snap-fit neodymium magnetic collar clips to prevent charging cords from slipping.",
    price: 699,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
    stock: 45,
  },
  {
    name: "Minimalist Brass Desk Ruler 30cm",
    description: "Solid heavy-gauge milled golden brass precision ruler featuring laser-etched metric and imperial measurements.",
    price: 599,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    stock: 30,
  },
];

async function populateStoreDatabase() {
  try {
    const mongoConnectionTarget = process.env.dbUrl || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopkart";

    console.log("Connecting to MongoDB for catalog seed...");
    await mongoose.connect(mongoConnectionTarget);
    console.log("✓ Connected to MongoDB.");

    // Purge legacy records
    const deletionOutcome = await Product.deleteMany({});
    console.log(`Cleared previous catalog records (${deletionOutcome.deletedCount} items).`);

    // Insert curated seed products
    const insertedArtifacts = await Product.insertMany(seededProducts);
    console.log(`✓ Successfully seeded ${insertedArtifacts.length} distinct products into MongoDB!`);

    // Category breakdown summary
    const categoryTallies = insertedArtifacts.reduce((tallies, currentItem) => {
      tallies[currentItem.category] = (tallies[currentItem.category] || 0) + 1;
      return tallies;
    }, {});
    console.log("Catalog Distribution:", categoryTallies);

    await mongoose.disconnect();
    console.log("✓ MongoDB gracefully disconnected.");
    process.exit(0);
  } catch (seedingFailure) {
    console.error("✗ Database seeding process failed:", seedingFailure.message);
    process.exit(1);
  }
}

// Execute when invoked directly
if (process.argv[1] && (process.argv[1].endsWith("seed.js") || process.argv[1].includes("seed"))) {
  populateStoreDatabase();
}
