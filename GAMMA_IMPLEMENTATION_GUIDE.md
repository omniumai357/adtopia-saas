# 🎨 Gamma Landing Page - Complete Implementation Guide

## 🚀 **Gamma Pro Setup & Features (2025 Updates)**

### **Gamma Pro Benefits ($180/yr)**
- **Unlimited AI Content Generation**: Auto-populate hero, questionnaire, gallery
- **Unlimited Exports**: No credit limits, full collaboration
- **GPU Acceleration**: Fast multimedia processing
- **Custom Domains**: Live hosting with analytics
- **API Integration**: Stripe/Supabase webhooks, Zapier automation

### **Key Features for BizBox/AdTopia**
- **AI Content Gen**: "5-page SMB ad promo: Hero stats, questionnaire, tiers, gallery, CTA"
- **Design Customization**: Cosmic navy #0A0F2B/neon green #39FF14, Orbitron/Exo2 fonts
- **Multimedia**: Full-screen zoom/pan/mockups, lazy loading
- **Export/Host**: Live URL hosting, real-time collaboration
- **Integrations**: Stripe/Supabase hooks, SEO, forms

## 🎯 **Build Flow: Pre-Contact Live Site**

### **Step 1: Pre-Build (Gamma Pro)**
```markdown
**Prompt for AI Content Generation:**
"5-page promo for BizBox beta (powered by AdTopia): Hero gradients/animations (220% boost), multi-step questionnaire (icons/sliders/validation), pricing table (3 tiers checkmarks/popular highlight), gallery bento (varying ad cards, hearts/ROI badges), CTA buttons (Get Preview)."

**Expected Output:**
- Auto-populated hero with "220% Lead Boost"
- Multi-step questionnaire with icons/sliders
- Pricing table with 3 tiers and popular highlight
- Gallery bento grid with 29+ ad cards
- CTA buttons for preview generation
```

### **Step 2: Design Customization**
```css
/* Color Scheme */
:root {
  --cosmic-navy: #0A0F2B;
  --neon-green: #39FF14;
  --gradient-primary: linear-gradient(135deg, #0A0F2B 0%, #1a1f3a 100%);
  --gradient-accent: linear-gradient(135deg, #39FF14 0%, #2dd4bf 100%);
}

/* Typography */
.hero-title {
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  font-size: 4rem;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.body-text {
  font-family: 'Exo 2', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

/* Glassmorphism Effects */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

/* Animations */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(57, 255, 20, 0.3); }
  50% { box-shadow: 0 0 40px rgba(57, 255, 20, 0.6); }
}

.glow-effect {
  animation: glow 2s ease-in-out infinite;
}
```

### **Step 3: Export & Host**
- **Export Time**: ~5 minutes, no code required
- **Live URL**: `acme-gamma.bizbox.host` (custom subdomain)
- **Real-time Collaboration**: Up to 5 users
- **Analytics**: Built-in performance tracking

## 📱 **5-Page Structure Implementation**

### **Page 1: Hero with Gradients/Animations**
```html
<!-- Hero Section with 220% Lead Boost -->
<div class="hero-section min-h-screen bg-gradient-to-br from-[#0A0F2B] via-[#1a1f3a] to-[#2d1b69]">
  <div class="container mx-auto px-4 py-20">
    <div class="text-center text-white">
      <!-- Animated Title -->
      <h1 class="hero-title mb-6 animate-pulse">
        🚀 220% Lead Boost
      </h1>
      
      <!-- Subtitle with Glow Effect -->
      <p class="text-2xl mb-8 font-light">
        QR Code Magic for Local Businesses
      </p>
      
      <!-- Stats Cards with Glassmorphism -->
      <div class="flex justify-center space-x-6 mb-12">
        <div class="glass-card p-6 glow-effect">
          <div class="text-4xl font-bold text-[#39FF14]">20%</div>
          <div class="text-sm">More Calls</div>
        </div>
        <div class="glass-card p-6 glow-effect">
          <div class="text-4xl font-bold text-[#39FF14]">300%</div>
          <div class="text-sm">ROI vs Agencies</div>
        </div>
        <div class="glass-card p-6 glow-effect">
          <div class="text-4xl font-bold text-[#39FF14]">24h</div>
          <div class="text-sm">Delivery</div>
        </div>
      </div>
      
      <!-- CTA Button with Animation -->
      <button class="cta-button bg-gradient-to-r from-[#39FF14] to-[#2dd4bf] text-black px-12 py-4 rounded-lg text-xl font-bold hover:scale-105 transition-transform duration-300">
        Get Your Preview Now
      </button>
    </div>
  </div>
</div>
```

### **Page 2: Multi-Step Questionnaire**
```html
<!-- Questionnaire with Icons/Sliders -->
<div class="questionnaire-section bg-white py-20">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-12 text-[#0A0F2B]">
      What's Your Business?
    </h2>
    
    <!-- Business Type Selection -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-all duration-300 hover:scale-105">
        <div class="text-6xl mb-4 text-center">🔧</div>
        <div class="font-semibold text-center">Plumbing</div>
      </div>
      <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-all duration-300 hover:scale-105">
        <div class="text-6xl mb-4 text-center">⚡</div>
        <div class="font-semibold text-center">Electrical</div>
      </div>
      <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-all duration-300 hover:scale-105">
        <div class="text-6xl mb-4 text-center">🏠</div>
        <div class="font-semibold text-center">HVAC</div>
      </div>
      <div class="business-type-card p-6 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-all duration-300 hover:scale-105">
        <div class="text-6xl mb-4 text-center">🚗</div>
        <div class="font-semibold text-center">Auto Repair</div>
      </div>
    </div>
    
    <!-- Current Marketing Slider -->
    <div class="marketing-slider mb-12">
      <h3 class="text-2xl font-semibold mb-6 text-center">How do you currently get customers?</h3>
      <div class="space-y-4">
        <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-colors">
          <input type="checkbox" class="mr-4 w-5 h-5 text-[#39FF14]">
          <span>Google Ads (expensive, hard to track)</span>
        </label>
        <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-colors">
          <input type="checkbox" class="mr-4 w-5 h-5 text-[#39FF14]">
          <span>Word of mouth (unreliable)</span>
        </label>
        <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-colors">
          <input type="checkbox" class="mr-4 w-5 h-5 text-[#39FF14]">
          <span>Business cards (static, no tracking)</span>
        </label>
      </div>
    </div>
    
    <!-- Goals Selection with Icons -->
    <div class="goals-selection">
      <h3 class="text-2xl font-semibold mb-6 text-center">What would help you most?</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="goal-card p-6 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-all duration-300 hover:scale-105">
          <div class="text-4xl mb-4 text-center">📈</div>
          <div class="font-semibold mb-2 text-center">More Calls</div>
          <div class="text-sm text-gray-600 text-center">Track every scan, see who's interested</div>
        </div>
        <div class="goal-card p-6 border-2 border-gray-200 rounded-lg hover:border-[#39FF14] cursor-pointer transition-all duration-300 hover:scale-105">
          <div class="text-4xl mb-4 text-center">🌍</div>
          <div class="font-semibold mb-2 text-center">Bilingual Support</div>
          <div class="text-sm text-gray-600 text-center">Reach Spanish-speaking customers</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### **Page 3: Pricing Table with Popular Highlight**
```html
<!-- Pricing Table with 3 Tiers -->
<div class="pricing-section bg-gray-50 py-20">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-12 text-[#0A0F2B]">
      Choose Your Package
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Starter Package -->
      <div class="pricing-card p-8 border-2 border-gray-200 rounded-lg relative">
        <div class="text-center">
          <h3 class="text-2xl font-bold mb-4">Starter Package</h3>
          <div class="text-4xl font-bold text-[#39FF14] mb-4">$49</div>
          <div class="text-sm text-gray-600 mb-6">Quick start, big results</div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              Custom QR code
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              7-day live preview
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              Mobile responsive
            </li>
          </ul>
          <button class="w-full bg-[#39FF14] text-black py-3 rounded-lg font-semibold hover:bg-[#2dd4bf] transition-colors">
            Get Started
          </button>
        </div>
      </div>

      <!-- Growth Package (Popular) -->
      <div class="pricing-card p-8 border-2 border-[#39FF14] rounded-lg relative transform scale-105 glow-effect">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span class="bg-[#39FF14] text-black px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
        <div class="text-center">
          <h3 class="text-2xl font-bold mb-4">Growth Package</h3>
          <div class="text-4xl font-bold text-[#39FF14] mb-4">$297</div>
          <div class="text-sm text-gray-600 mb-6">60% off beta pricing</div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              Everything in Starter
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              5 custom ad cards
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              12 months hosting
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              Free domain + SSL
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              Bilingual support
            </li>
          </ul>
          <button class="w-full bg-[#39FF14] text-black py-3 rounded-lg font-semibold hover:bg-[#2dd4bf] transition-colors">
            Get Growth Package
          </button>
        </div>
      </div>

      <!-- Ultimate Package -->
      <div class="pricing-card p-8 border-2 border-gray-200 rounded-lg relative">
        <div class="text-center">
          <h3 class="text-2xl font-bold mb-4">Ultimate Package</h3>
          <div class="text-4xl font-bold text-[#39FF14] mb-4">$1,997</div>
          <div class="text-sm text-gray-600 mb-6">200%+ ROI FOMO</div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              Everything in Growth
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              Unlimited ad cards
            </li>
            <li class="flex items-center">
              <span class="text-[#39FF14] mr-2">✓</span>
              White-label option
            </li>
          </ul>
          <button class="w-full bg-[#39FF14] text-black py-3 rounded-lg font-semibold hover:bg-[#2dd4bf] transition-colors">
            Get Ultimate Package
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### **Page 4: Gallery Bento with Hearts/ROI Badges**
```html
<!-- Gallery Bento Grid -->
<div class="gallery-section bg-white py-20">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-12 text-[#0A0F2B]">
      Heart Your Favorites
    </h2>
    
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
          <div class="roi-badge bg-[#39FF14] text-black px-2 py-1 rounded-full text-xs font-semibold mt-1">
            300% ROI
          </div>
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
          <div class="roi-badge bg-[#39FF14] text-black px-2 py-1 rounded-full text-xs font-semibold mt-1">
            220% Boost
          </div>
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
          <div class="roi-badge bg-[#39FF14] text-black px-2 py-1 rounded-full text-xs font-semibold mt-1">
            400% vs Agencies
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### **Page 5: CTA with FOMO Elements**
```html
<!-- CTA Section with FOMO -->
<div class="cta-section bg-gradient-to-br from-[#0A0F2B] to-[#1a1f3a] py-20">
  <div class="max-w-4xl mx-auto px-4 text-center text-white">
    <!-- Urgency Timer -->
    <div class="urgency-timer bg-red-600 p-4 rounded-lg mb-8">
      <div class="text-lg font-semibold">⏰ Limited Time Offer</div>
      <div class="text-2xl font-bold" id="countdown">7 days, 23 hours, 59 minutes</div>
      <div class="text-sm">Save 60-80% - Spots fill fast!</div>
    </div>
    
    <!-- Recent Buys Carousel -->
    <div class="recent-buys bg-green-100 text-green-800 p-4 rounded-lg mb-8">
      <div class="text-center">
        <div class="text-sm">Recent purchases:</div>
        <div class="text-lg font-semibold">
          John from ACME Construction just purchased 2 minutes ago
        </div>
      </div>
    </div>
    
    <!-- Main CTA -->
    <h2 class="text-4xl font-bold mb-6">Ready to Boost Your Business?</h2>
    <p class="text-xl mb-8">Join 1,247+ businesses already using our QR code system</p>
    
    <div class="flex justify-center space-x-4 mb-8">
      <button class="bg-[#39FF14] text-black px-12 py-4 rounded-lg text-xl font-bold hover:bg-[#2dd4bf] transition-colors">
        Get Your Preview Now
      </button>
      <button class="border-2 border-[#39FF14] text-[#39FF14] px-12 py-4 rounded-lg text-xl font-bold hover:bg-[#39FF14] hover:text-black transition-colors">
        View Gallery
      </button>
    </div>
    
    <!-- Trust Badges -->
    <div class="flex items-center justify-center space-x-8 text-sm text-gray-300">
      <span>🔒 SSL Secured</span>
      <span>💳 Stripe Powered</span>
      <span>✅ 30-day guarantee</span>
    </div>
  </div>
</div>
```

## 🔗 **Integration Points**

### **Supabase Integration**
```javascript
// Questionnaire data to backend
const submitQuestionnaire = async (formData) => {
  const { data, error } = await supabase
    .from('questionnaire_responses')
    .insert({
      email: formData.email,
      business_type: formData.businessType,
      current_marketing: formData.currentMarketing,
      goals: formData.goals,
      lead_score: calculateLeadScore(formData),
      created_at: new Date().toISOString()
    });
  
  if (!error) {
    // Generate custom preview link
    const previewLink = await generatePreviewLink(data.id);
    // Send to admin dashboard for review
    await notifyAdmin(data.id);
  }
};

// Lead scoring algorithm
const calculateLeadScore = (formData) => {
  let score = 0;
  if (formData.businessType === 'plumbing') score += 20;
  if (formData.currentMarketing.includes('google_ads')) score += 15;
  if (formData.goals.includes('more_calls')) score += 25;
  if (formData.goals.includes('bilingual')) score += 10;
  return score;
};
```

### **Stripe Integration**
```javascript
// Stripe checkout with upsells
const initiateCheckout = async (packageType, upsells = []) => {
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      package: packageType,
      upsells: upsells,
      success_url: `${window.location.origin}/success`,
      cancel_url: `${window.location.origin}/cancel`
    })
  });
  
  const session = await response.json();
  await stripe.redirectToCheckout({ sessionId: session.id });
};
```

### **Resend Email Integration**
```javascript
// Post-purchase email with subdomain
const sendConfirmationEmail = async (customerEmail, subdomain) => {
  const response = await fetch('/api/send-confirmation-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customerEmail,
      subdomain: subdomain,
      template: 'purchase-confirmation',
      data: {
        customer_name: 'Joe',
        package_type: 'Growth Package',
        subdomain_url: `https://${subdomain}.bizbox.host`
      }
    })
  });
  
  return response.json();
};
```

## 🎯 **FOMO Elements Implementation**

### **Urgency Timer**
```javascript
// Countdown timer
const startCountdown = () => {
  const countdownElement = document.getElementById('countdown');
  const endTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000); // 7 days
  
  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    countdownElement.innerHTML = `${days} days, ${hours} hours, ${minutes} minutes`;
    
    if (distance < 0) {
      clearInterval(timer);
      countdownElement.innerHTML = "Offer Expired!";
    }
  }, 1000);
};
```

### **Exit Intent Popup**
```javascript
// Exit intent detection
const setupExitIntent = () => {
  let exitIntentShown = false;
  
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0 && !exitIntentShown) {
      showExitPopup();
      exitIntentShown = true;
    }
  });
};

const showExitPopup = () => {
  const popup = document.getElementById('exit-popup');
  popup.classList.remove('hidden');
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    popup.classList.add('hidden');
  }, 10000);
};
```

## 🚀 **Deployment & Hosting**

### **Gamma Pro Hosting**
- **Custom Domain**: `acme-gamma.bizbox.host`
- **SSL Certificate**: Automatic HTTPS
- **CDN**: Global content delivery
- **Analytics**: Built-in performance tracking
- **Real-time Collaboration**: Up to 5 users

### **Performance Optimization**
- **Lazy Loading**: Images load as needed
- **GPU Acceleration**: Fast multimedia processing
- **Mobile-First**: 95% responsive design
- **A/B Testing**: Built-in experimentation

## 🎯 **Success Metrics**

### **Conversion Targets**
- **6-8% conversion rate** guaranteed
- **20% call boost** for $49 package
- **60% off beta** for $1,997 package
- **220% lead boost** overall

### **Performance Metrics**
- **Page load**: < 2 seconds
- **Questionnaire completion**: 40% of visitors
- **Gallery engagement**: 20% of visitors
- **Checkout conversion**: 6-8% of engaged visitors

## 🎉 **The Dopamine Trap Flow**

**Tease live Gamma site** → **Interactive questionnaire** → **Heart favorites** → **Admin review** → **Stripe close** → **Subdomain delivery**

**This creates the perfect dopamine trap: Live tease → Interactive review → Instant unlock. Ties BizBox.host (MVP funnel) to AdTopia.io (AI marketplace)—beta shield, no core taint.**

**Ready for implementation with Gamma Pro!**
