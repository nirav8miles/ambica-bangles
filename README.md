# Ambica Bangles - Premium E-Commerce Website

A sophisticated, luxury e-commerce website for Ambica Bangles, featuring a modern design inspired by premium jewelry brands like Jos Alukkas. Built with vanilla HTML, CSS, and JavaScript.

![Ambica Bangles](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌟 Features

### Design & UI
- **Premium Design**: Elegant, luxury aesthetic inspired by Jos Alukkas
- **Responsive Layout**: Mobile-first design that works on all devices
- **Hero Slider**: Full-screen image slider with smooth transitions
- **Smooth Animations**: Fade-ins, slide-ups, and hover effects throughout
- **Modern Typography**: Cormorant Garamond + Montserrat font pairing

### Functionality
- **Product Catalog**: Dynamic product grid with filtering and sorting
- **Shopping Cart**: Full cart functionality with localStorage persistence
- **Category Pages**: Dedicated pages for each jewelry category
- **Search**: Real-time product search functionality
- **Contact Form**: Validated contact form with email integration
- **Google Maps**: Interactive map showing store location

### Pages
1. **Homepage** - Hero slider, featured products, categories, brand story
2. **Shop** - Complete product catalog with filters
3. **Category Pages** - Heritage, AD, LCT, Kundan, Necklaces
4. **About** - Brand story and values
5. **Contact** - Contact form and location map
6. **Cart** - Shopping cart with checkout

## 🎨 Design Highlights

- **Color Palette**: Gold gradients (#C9A961, #8B6914) with cream backgrounds
- **Premium Fonts**: Cormorant Garamond for headings, Montserrat for body
- **Sophisticated Shadows**: Gold-tinted shadows for luxury feel
- **Glass-morphism**: Modern backdrop blur effects
- **Smooth Transitions**: 0.3s ease transitions throughout

## 📁 Project Structure

```
ambica-bangles/
├── index.html              # Homepage
├── shop.html              # Product catalog
├── category.html          # Category pages
├── cart.html              # Shopping cart
├── about.html             # About page
├── contact.html           # Contact page
├── css/
│   ├── style.css          # Main stylesheet (1400+ lines)
│   ├── shop.css           # Shop page styles
│   ├── cart.css           # Cart page styles
│   ├── about.css          # About page styles
│   └── contact.css        # Contact page styles
├── js/
│   ├── main.js            # Core functionality
│   ├── products.js        # Product management
│   ├── cart.js            # Shopping cart logic
│   ├── shop.js            # Shop page functionality
│   ├── category.js        # Category page logic
│   └── contact.js         # Contact form handling
├── data/
│   └── products.json      # Product database
├── assets/
│   └── images/            # Product images
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nirav8miles/ambica-bangles.git
cd ambica-bangles
```

2. **Open in browser**
```bash
# Simply open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 💻 Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid, Flexbox, Custom Properties
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Font Awesome**: Icons
- **Google Fonts**: Typography
- **LocalStorage API**: Cart persistence

## 🎯 Key Features Breakdown

### Product Management
- Dynamic product loading from JSON
- Category filtering
- Price range filtering
- Search functionality
- Sorting options (price, name, newest)

### Shopping Cart
- Add/remove items
- Quantity management
- Price calculations (subtotal, tax, shipping)
- LocalStorage persistence
- Toast notifications

### Responsive Design
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📱 Contact Information

**Ambica Bangles**
- **Address**: Silicon Valley, 110, Shivranjani Cross Rd, Ahmedabad, Gujarat 380015
- **Phone**: +91 99254 65553
- **Email**: info@ambicabangles.com
- **Instagram**: [@ambicabangles](https://www.instagram.com/ambicabangles)
- **Hours**: Mon - Sat: 10:00 AM - 8:00 PM

## 🌐 Live Demo

Visit the live website: [Ambica Bangles](#) *(Add your deployment URL)*

## 📸 Screenshots

### Homepage
![Homepage Hero](screenshots/hero.png)
![Featured Products](screenshots/products.png)

### Shop Page
![Product Catalog](screenshots/shop.png)

### Cart
![Shopping Cart](screenshots/cart.png)

## 🔧 Customization

### Changing Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-gold: #C9A961;
    --dark-gold: #8B6914;
    --light-gold: #E8D5A8;
    /* ... */
}
```

### Adding Products
Edit `data/products.json`:
```json
{
    "id": 13,
    "name": "New Product",
    "category": "heritage",
    "price": 15999,
    "image": "assets/images/product13.png",
    "description": "Product description",
    "inStock": true,
    "featured": false
}
```

## 📝 To-Do / Future Enhancements

- [ ] Product detail pages with image galleries
- [ ] Complete checkout flow
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Order confirmation page
- [ ] User authentication
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Backend API integration
- [ ] Admin panel for product management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Nirav Pachchigar**
- GitHub: [@nirav8miles](https://github.com/nirav8miles)

## 🙏 Acknowledgments

- Design inspiration: Jos Alukkas
- Icons: Font Awesome
- Fonts: Google Fonts (Cormorant Garamond, Montserrat)
- Images: Ambica Bangles Instagram

## 📊 Project Stats

- **Total Files**: 20+
- **Lines of Code**: 5000+
- **CSS Lines**: 1400+
- **JavaScript Lines**: 1500+
- **Pages**: 6
- **Components**: 15+

---

**Creating Hand Stories for 11,000+ Brides** ❤️

Made with ❤️ by Bob (AI Assistant) for Ambica Bangles