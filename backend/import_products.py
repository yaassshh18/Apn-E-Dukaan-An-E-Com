import os
import random

import django
from django.utils.text import slugify

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from products.models import Category, Product, Review
from users.models import User


PRODUCTS = [
    {
        "title": "Nike Running Sports Shoes (Grey & Red)",
        "category": "Fashion & Clothing",
        "price": "3499.00",
        "stock": 25,
        "image": "products/product_1.jpg",
        "description": (
            "Upgrade your daily runs with these lightweight and stylish Nike sports shoes. "
            "Designed with breathable mesh and cushioned soles, they provide superior comfort "
            "and performance.\n\n"
            "Key Features:\n"
            "- Material: Mesh upper with rubber sole\n"
            "- Fit Type: Regular fit\n"
            "- Comfort: Cushioned insole for all-day wear\n"
            "- Design: Modern sporty look with contrast detailing\n"
            "- Usage: Running, gym, casual wear"
        ),
    },
    {
        "title": "Turquoise Beaded Bracelet",
        "category": "Handmade Crafts",
        "price": "699.00",
        "stock": 40,
        "image": "products/product_2.jpg",
        "description": (
            "Add a touch of elegance to your outfit with this handcrafted turquoise bead bracelet. "
            "Perfect for both ethnic and western styles.\n\n"
            "Key Features:\n"
            "- Material: Artificial turquoise stones with alloy beads\n"
            "- Closure: Lobster clasp\n"
            "- Style: Bohemian / Ethnic\n"
            "- Occasion: Daily wear, festive, gifting"
        ),
    },
    {
        "title": "Handwoven Decorative Bamboo Tray (Round)",
        "category": "Home & Garden",
        "price": "899.00",
        "stock": 18,
        "image": "products/product_3.jpg",
        "description": (
            "Enhance your home decor with this beautifully handcrafted bamboo tray featuring "
            "intricate spiral weaving.\n\n"
            "Key Features:\n"
            "- Material: Natural bamboo\n"
            "- Shape: Round\n"
            "- Design: Traditional woven pattern\n"
            "- Usage: Wall decor, serving tray"
        ),
    },
    {
        "title": "Bamboo Storage Box with Lid",
        "category": "Home & Garden",
        "price": "1199.00",
        "stock": 14,
        "image": "products/product_4.jpg",
        "description": (
            "Keep your essentials organized with this eco-friendly bamboo storage box. Stylish "
            "and functional for modern homes.\n\n"
            "Key Features:\n"
            "- Material: Bamboo\n"
            "- Design: Woven texture with lid\n"
            "- Usage: Storage, kitchen, decor\n"
            "- Eco-Friendly: Sustainable material"
        ),
    },
    {
        "title": "Handwoven Fruit Basket Set (2 Pieces)",
        "category": "Home & Garden",
        "price": "999.00",
        "stock": 22,
        "image": "products/product_5.jpeg",
        "description": (
            "Bring natural charm to your dining space with this set of handwoven baskets, perfect "
            "for serving fruits and snacks.\n\n"
            "Key Features:\n"
            "- Material: Natural fiber (rattan/bamboo)\n"
            "- Set Includes: 2 baskets\n"
            "- Design: Elevated base with wavy edges\n"
            "- Usage: Fruit storage, table decor"
        ),
    },
    {
        "title": "Handcrafted Woven Pot with Lid & Handle",
        "category": "Home & Garden",
        "price": "1299.00",
        "stock": 12,
        "image": "products/product_6.jpeg",
        "description": (
            "A unique blend of tradition and utility, this handcrafted pot is ideal for storage "
            "or decorative purposes.\n\n"
            "Key Features:\n"
            "- Material: Woven fiber with clay base\n"
            "- Design: Lid with handle\n"
            "- Usage: Storage, decor, gifting\n"
            "- Style: Rustic"
        ),
    },
    {
        "title": "Bamboo Storage Box (Round with Lid)",
        "category": "Home & Garden",
        "price": "1099.00",
        "stock": 16,
        "image": "products/product_7.jpg",
        "description": (
            "A stylish and durable bamboo box designed for organizing your daily essentials while "
            "adding a natural touch.\n\n"
            "Key Features:\n"
            "- Material: Bamboo\n"
            "- Shape: Round\n"
            "- Usage: Storage, kitchen, decor\n"
            "- Durability: Strong and lightweight"
        ),
    },
    {
        "title": "Macrame Wall Hanging (Boho Decor)",
        "category": "Home & Garden",
        "price": "1499.00",
        "stock": 10,
        "image": "products/product_8.jpg",
        "description": (
            "Elevate your wall decor with this elegant macrame wall hanging featuring intricate "
            "knot patterns and tassels.\n\n"
            "Key Features:\n"
            "- Material: Cotton rope with wooden rod\n"
            "- Style: Bohemian\n"
            "- Design: Handmade with tassels\n"
            "- Usage: Living room, bedroom decor"
        ),
    },
    {
        "title": "Hanging Coconut Shell Planter",
        "category": "Home & Garden",
        "price": "749.00",
        "stock": 20,
        "image": "products/product_9.jpg",
        "description": (
            "Add a natural aesthetic to your space with this eco-friendly hanging planter made "
            "from coconut shell.\n\n"
            "Key Features:\n"
            "- Material: Coconut shell\n"
            "- Design: Hanging planter with carved pattern\n"
            "- Usage: Indoor/outdoor plants\n"
            "- Eco-Friendly: Sustainable product"
        ),
    },
    {
        "title": "Blue Beaded Necklace (Statement Jewelry)",
        "category": "Fashion & Clothing",
        "price": "1299.00",
        "stock": 28,
        "image": "products/product_10.jpg",
        "description": (
            "Make a bold fashion statement with this elegant blue beaded necklace featuring "
            "intricate detailing.\n\n"
            "Key Features:\n"
            "- Material: Resin beads with metal accents\n"
            "- Style: Statement / Ethnic fusion\n"
            "- Closure: Adjustable clasp\n"
            "- Occasion: Party, festive, casual"
        ),
    },
    {
        "title": "Mandala Wall Tapestry (Black & White)",
        "category": "Home & Garden",
        "price": "899.00",
        "stock": 19,
        "image": "products/product_11.jpg",
        "description": (
            "Transform your space with this eye-catching mandala wall tapestry, perfect for "
            "creating a calm and artistic vibe.\n\n"
            "Key Features:\n"
            "- Material: Fabric (cotton/poly blend)\n"
            "- Design: Mandala print\n"
            "- Usage: Wall decor, backdrop\n"
            "- Style: Modern boho"
        ),
    },
]


def get_or_create_category(name: str) -> Category:
    slug = slugify(name)
    category, _ = Category.objects.get_or_create(
        slug=slug,
        defaults={"name": name},
    )
    if category.name != name:
        category.name = name
        category.save(update_fields=["name"])
    return category


def seed_products() -> None:
    seller, _ = User.objects.get_or_create(
        username="demo_seller",
        defaults={
            "email": "demo_seller@example.com",
            "role": "SELLER",
            "is_verified": True,
            "is_active": True,
        },
    )
    if seller.role != "SELLER" or not seller.is_verified:
        seller.role = "SELLER"
        seller.is_verified = True
        seller.is_active = True
        seller.save(update_fields=["role", "is_verified", "is_active"])

    created = 0
    updated = 0
    for item in PRODUCTS:
        category = get_or_create_category(item["category"])
        _, was_created = Product.objects.update_or_create(
            title=item["title"],
            defaults={
                "seller": seller,
                "category": category,
                "description": item["description"],
                "price": item["price"],
                "stock": item["stock"],
                "is_active": True,
                "image": item["image"],
            },
        )
        if was_created:
            created += 1
        else:
            updated += 1

    # Seed randomized reviews so UI ratings vary between 4.0 and 5.0
    buyer_users = []
    for i in range(1, 6):
        buyer, _ = User.objects.get_or_create(
            username=f"demo_buyer_{i}",
            defaults={
                "email": f"demo_buyer_{i}@example.com",
                "role": "BUYER",
                "is_verified": True,
                "is_active": True,
            },
        )
        if buyer.role != "BUYER" or not buyer.is_verified:
            buyer.role = "BUYER"
            buyer.is_verified = True
            buyer.is_active = True
            buyer.save(update_fields=["role", "is_verified", "is_active"])
        buyer_users.append(buyer)

    for product in Product.objects.all():
        # Recreate reviews each run to refresh randomized ratings.
        Review.objects.filter(product=product).delete()
        review_count = random.randint(2, 5)
        review_users = random.sample(buyer_users, k=review_count)
        for review_user in review_users:
            Review.objects.create(
                product=product,
                user=review_user,
                rating=random.randint(4, 5),
                comment="Great product quality and value.",
            )

    total = Product.objects.count()
    print(f"Products imported. Created: {created}, Updated: {updated}, Total: {total}")


if __name__ == "__main__":
    seed_products()
