# 🎨 Gamma Site Structure - 5-Page Landing

## 🚀 **Page 1: Hero - "220% Lead Boost"**

### **Full-Viewport Design**
```html
<!-- Hero Section -->
<div class="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
  <div class="container mx-auto px-4 py-20">
    <div class="text-center text-white">
      <h1 class="text-6xl font-bold mb-6 animate-pulse">
        🚀 220% Lead Boost
      </h1>
      <p class="text-2xl mb-8">
        QR Code Magic for Local Businesses
      </p>
      <div class="flex justify-center space-x-4 mb-12">
        <div class="bg-white/20 backdrop-blur rounded-lg p-4">
          <div class="text-3xl font-bold">20%</div>
          <div class="text-sm">More Calls</div>
        </div>
        <div class="bg-white/20 backdrop-blur rounded-lg p-4">
          <div class="text-3xl font-bold">300%</div>
          <div class="text-sm">ROI vs Agencies</div>
        </div>
        <div class="bg-white/20 backdrop-blur rounded-lg p-4">
          <div class="text-3xl font-bold">24h</div>
          <div class="text-sm">Delivery</div>
        </div>
      </div>
      <button class="bg-yellow-400 text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-yellow-300 transition-colors">
        Get Your Preview Now
      </button>
    </div>
  </div>
</div>
```

### **FOMO Elements**
- **Urgency Timer**: "Limited 7-day pre-launch: Save 60-80%"
- **Recent Buys Carousel**: "John from ACME just purchased 2 minutes ago"
- **Exit Popup**: "Wait! Don't miss out on 60% savings"

## 📋 **Page 2: Questionnaire - Multi-Step Lead Scoring**

### **Step 1: Business Type**
```html
<div class="max-w-4xl mx-auto p-8">
  <h2 class="text-3xl font-bold text-center mb-8">What's Your Business?</h2>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
      <div class="text-4xl mb-4">🔧</div>
      <div class="font-semibold">Plumbing</div>
    </div>
    <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
      <div class="text-4xl mb-4">⚡</div>
      <div class="font-semibold">Electrical</div>
    </div>
    <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
      <div class="text-4xl mb-4">🏠</div>
      <div class="font-semibold">HVAC</div>
    </div>
    <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
      <div class="text-4xl mb-4">🚗</div>
      <div class="font-semibold">Auto Repair</div>
    </div>
  </div>
</div>
```

### **Step 2: Current Marketing**
```html
<div class="max-w-4xl mx-auto p-8">
  <h2 class="text-3xl font-bold text-center mb-8">How do you currently get customers?</h2>
  <div class="space-y-4">
    <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
      <input type="checkbox" class="mr-4">
      <span>Google Ads (expensive, hard to track)</span>
    </label>
    <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
      <input type="checkbox" class="mr-4">
      <span>Word of mouth (unreliable)</span>
    </label>
    <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
      <input type="checkbox" class="mr-4">
      <span>Business cards (static, no tracking)</span>
    </label>
  </div>
</div>
```

### **Step 3: Goals & Preferences**
```html
<div class="max-w-4xl mx-auto p-8">
  <h2 class="text-3xl font-bold text-center mb-8">What would help you most?</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="goal-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
      <div class="text-2xl mb-4">📈</div>
      <div class="font-semibold mb-2">More Calls</div>
      <div class="text-sm text-gray-600">Track every scan, see who's interested</div>
    </div>
    <div class="goal-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
      <div class="text-2xl mb-4">🌍</div>
      <div class="font-semibold mb-2">Bilingual Support</div>
      <div class="text-sm text-gray-600">Reach Spanish-speaking customers</div>
    </div>
    <div class="goal-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
      <div class="text-2xl mb-4">📱</div>
      <div class="font-semibold mb-2">Mobile Ready</div>
      <div class="text-sm text-gray-600">Works on all phones and tablets</div>
    </div>
    <div class="goal-card p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
      <div class="text-2xl mb-4">⚡</div>
      <div class="font-semibold mb-2">Quick Setup</div>
      <div class="text-sm text-gray-600">Live in 24 hours, not weeks</div>
    </div>
  </div>
</div>
```

## 💰 **Page 3: Pricing Tiers with Hearts Animation**

### **Pricing Cards**
```html
<div class="max-w-6xl mx-auto p-8">
  <h2 class="text-4xl font-bold text-center mb-12">Choose Your Package</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    
    <!-- Starter Package -->
    <div class="pricing-card p-8 border-2 border-gray-200 rounded-lg relative">
      <div class="text-center">
        <h3 class="text-2xl font-bold mb-4">Starter Package</h3>
        <div class="text-4xl font-bold text-blue-600 mb-4">$49</div>
        <div class="text-sm text-gray-600 mb-6">Quick start, big results</div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Custom QR code
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            7-day live preview
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Mobile responsive
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Email support
          </li>
        </ul>
        <button class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>
    </div>

    <!-- Growth Package (Popular) -->
    <div class="pricing-card p-8 border-2 border-blue-500 rounded-lg relative transform scale-105">
      <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span class="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </span>
      </div>
      <div class="text-center">
        <h3 class="text-2xl font-bold mb-4">Growth Package</h3>
        <div class="text-4xl font-bold text-blue-600 mb-4">$297</div>
        <div class="text-sm text-gray-600 mb-6">60% off beta pricing</div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Everything in Starter
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            5 custom ad cards
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            12 months hosting
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Free domain + SSL
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Bilingual support
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Premium analytics
          </li>
        </ul>
        <button class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Get Growth Package
        </button>
      </div>
    </div>

    <!-- Ultimate Package -->
    <div class="pricing-card p-8 border-2 border-gray-200 rounded-lg relative">
      <div class="text-center">
        <h3 class="text-2xl font-bold mb-4">Ultimate Package</h3>
        <div class="text-4xl font-bold text-blue-600 mb-4">$1,997</div>
        <div class="text-sm text-gray-600 mb-6">200%+ ROI FOMO</div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Everything in Growth
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Unlimited ad cards
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            White-label option
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Priority support
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-2">✓</span>
            Custom integrations
          </li>
        </ul>
        <button class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Get Ultimate Package
        </button>
      </div>
    </div>
  </div>
</div>
```

### **ROI Badges**
```html
<div class="max-w-4xl mx-auto p-8 text-center">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="roi-badge p-6 bg-green-100 rounded-lg">
      <div class="text-3xl font-bold text-green-600">300%</div>
      <div class="text-sm text-gray-600">ROI vs Agencies</div>
    </div>
    <div class="roi-badge p-6 bg-blue-100 rounded-lg">
      <div class="text-3xl font-bold text-blue-600">20%</div>
      <div class="text-sm text-gray-600">More Calls</div>
    </div>
    <div class="roi-badge p-6 bg-purple-100 rounded-lg">
      <div class="text-3xl font-bold text-purple-600">24h</div>
      <div class="text-sm text-gray-600">Delivery</div>
    </div>
  </div>
</div>
```

## 🖼️ **Page 4: Gallery Review - Bento Grid with Hearts**

### **Ad Card Gallery**
```html
<div class="max-w-7xl mx-auto p-8">
  <h2 class="text-4xl font-bold text-center mb-12">Heart Your Favorites</h2>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    
    <!-- ACME Construction Card -->
    <div class="gallery-card relative group cursor-pointer">
      <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img src="/gallery/acme-construction.jpg" alt="ACME Construction" class="w-full h-full object-cover">
      </div>
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
        <div class="heart-icon text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ❤️
        </div>
      </div>
      <div class="mt-2 text-center">
        <div class="font-semibold">ACME Construction</div>
        <div class="text-sm text-gray-600">Professional & Clean</div>
      </div>
    </div>

    <!-- Christmas Holiday Card -->
    <div class="gallery-card relative group cursor-pointer">
      <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img src="/gallery/christmas-holiday.jpg" alt="Christmas Holiday" class="w-full h-full object-cover">
      </div>
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
        <div class="heart-icon text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ❤️
        </div>
      </div>
      <div class="mt-2 text-center">
        <div class="font-semibold">Christmas Holiday</div>
        <div class="text-sm text-gray-600">Festive & Seasonal</div>
      </div>
    </div>

    <!-- Summer Sale Card -->
    <div class="gallery-card relative group cursor-pointer">
      <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img src="/gallery/summer-sale.jpg" alt="Summer Sale" class="w-full h-full object-cover">
      </div>
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
        <div class="heart-icon text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ❤️
        </div>
      </div>
      <div class="mt-2 text-center">
        <div class="font-semibold">Summer Sale</div>
        <div class="text-sm text-gray-600">Promotional & Eye-catching</div>
      </div>
    </div>

    <!-- Add more cards... -->
  </div>
</div>
```

### **Hearts Animation**
```css
.heart-icon {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

## 🛒 **Page 5: Checkout CTA - Multi-Step with Upsells**

### **Cart Summary**
```html
<div class="max-w-4xl mx-auto p-8">
  <h2 class="text-3xl font-bold text-center mb-8">Your Selections</h2>
  
  <div class="bg-gray-50 rounded-lg p-6 mb-8">
    <h3 class="text-xl font-semibold mb-4">Selected Cards</h3>
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="/gallery/acme-construction.jpg" alt="ACME Construction" class="w-16 h-16 rounded-lg mr-4">
          <div>
            <div class="font-semibold">ACME Construction</div>
            <div class="text-sm text-gray-600">Professional & Clean</div>
          </div>
        </div>
        <div class="text-red-500 text-2xl">❤️</div>
      </div>
      <!-- Add more selected cards... -->
    </div>
  </div>

  <div class="bg-blue-50 rounded-lg p-6 mb-8">
    <h3 class="text-xl font-semibold mb-4">Upsells</h3>
    <div class="space-y-4">
      <label class="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
        <div>
          <div class="font-semibold">Custom Domain</div>
          <div class="text-sm text-gray-600">yourbusiness.bizbox.host</div>
        </div>
        <div class="text-green-600 font-semibold">+$9.99/mo</div>
      </label>
      <label class="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
        <div>
          <div class="font-semibold">Advanced Tracking</div>
          <div class="text-sm text-gray-600">Detailed analytics & insights</div>
        </div>
        <div class="text-green-600 font-semibold">+$19.99/mo</div>
      </label>
    </div>
  </div>

  <div class="text-center">
    <div class="text-2xl font-bold mb-4">Total: $297</div>
    <div class="text-sm text-gray-600 mb-6">60% off beta pricing</div>
    <button class="bg-green-600 text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors">
      Complete Purchase
    </button>
    <div class="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
      <span>🔒 SSL Secured</span>
      <span>💳 Stripe Powered</span>
      <span>✅ 30-day guarantee</span>
    </div>
  </div>
</div>
```

### **Trust Badges**
```html
<div class="max-w-4xl mx-auto p-8 text-center">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="trust-badge p-4">
      <div class="text-2xl mb-2">🔒</div>
      <div class="font-semibold">SSL Secured</div>
      <div class="text-sm text-gray-600">Your data is safe</div>
    </div>
    <div class="trust-badge p-4">
      <div class="text-2xl mb-2">💳</div>
      <div class="font-semibold">Stripe Powered</div>
      <div class="text-sm text-gray-600">Secure payments</div>
    </div>
    <div class="trust-badge p-4">
      <div class="text-2xl mb-2">✅</div>
      <div class="font-semibold">30-day Guarantee</div>
      <div class="text-sm text-gray-600">Money back if not satisfied</div>
    </div>
  </div>
</div>
```

## 🎯 **FOMO Elements Throughout**

### **Urgency Timer**
```html
<div class="urgency-timer bg-red-600 text-white p-4 text-center">
  <div class="text-lg font-semibold">⏰ Limited Time Offer</div>
  <div class="text-2xl font-bold" id="countdown">7 days, 23 hours, 59 minutes</div>
  <div class="text-sm">Save 60-80% - Spots fill fast!</div>
</div>
```

### **Recent Buys Carousel**
```html
<div class="recent-buys bg-green-100 p-4 rounded-lg">
  <div class="text-center">
    <div class="text-sm text-gray-600">Recent purchases:</div>
    <div class="text-lg font-semibold text-green-600">
      John from ACME Construction just purchased 2 minutes ago
    </div>
  </div>
</div>
```

### **Exit Popup**
```html
<div id="exit-popup" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-lg p-8 max-w-md text-center">
      <h3 class="text-2xl font-bold mb-4">Wait! Don't miss out!</h3>
      <p class="text-gray-600 mb-6">Get 60% off your first package</p>
      <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
        Claim Your Discount
      </button>
    </div>
  </div>
</div>
```

## 🚀 **Implementation Notes**

### **Gamma Pro Setup**
- **Hosting**: $180/yr for Gamma Pro
- **Custom Domain**: Connect to bizbox.host
- **Analytics**: Track conversion rates
- **A/B Testing**: Test different headlines and CTAs

### **Integration Points**
- **Supabase**: Store questionnaire responses and lead scores
- **Stripe**: Handle payments and webhooks
- **Resend**: Send confirmation emails
- **Admin Dashboard**: Review leads and manage approvals

### **Performance Optimization**
- **Lazy Loading**: Load images as needed
- **CDN**: Use Cloudflare for fast delivery
- **Caching**: Cache static assets
- **Mobile First**: Optimize for mobile devices

**This structure creates the perfect dopamine trap: Tease → Heart → Review → Close → Deliver. Ready for implementation!**
