# 📞 SMB Outreach Script - Plumber Joe & ACME Strategy

## 🎯 **Target Audience: Local Service Businesses**

### **Primary Targets**
- **Plumbers**: Joe's Plumbing, ACME Plumbing, Elite Plumbing
- **Electricians**: Power Electric, Lightning Electric, Spark Electric
- **HVAC**: Cool Air HVAC, Comfort Systems, Climate Control
- **Auto Repair**: Auto Repair Pro, Quick Fix, Reliable Motors
- **Landscapers**: Green Thumb, Lawn Masters, Garden Pro

### **Secondary Targets**
- **Roofing**: Roofing Masters, Top Roof, Weather Shield
- **Flooring**: Flooring Experts, Carpet Pro, Hardwood Plus
- **Painting**: Painting Pros, Color Masters, Fresh Paint
- **Cleaning**: Cleaning Services, Sparkle Clean, Spotless
- **Handyman**: Fix It All, Handyman Plus, Mr. Fix It

## 📞 **Cold Call Script**

### **Opening Hook (15 seconds)**
```
"Hey Joe, this is [Your Name] from AdTopia. I noticed your plumbing business could use a modern boost. What if I told you I could get you 20% more calls starting this week with a simple QR code system that costs less than your monthly phone bill?"
```

### **Problem Identification (30 seconds)**
```
"Most plumbers I talk to are spending money on Google Ads but can't track if they're actually working. They're missing out on customers who prefer quick, mobile interactions. Sound familiar?"
```

### **Solution Presentation (45 seconds)**
```
"For just $49, I'll set you up with a professional QR code system that:
- Gets you a custom QR code for your business
- Works on all your existing materials - business cards, trucks, flyers
- Tracks every scan so you know exactly how many people are interested
- Delivers results in 24 hours

This is like having a digital business card that never runs out and tells you exactly who's interested in your services."
```

### **Social Proof (30 seconds)**
```
"I've helped 47 plumbers in your area increase their calls by an average of 35% in the first month. The system works, and I'm only offering this discount to the first 10 businesses this month."
```

### **Live Preview Hook (30 seconds)**
```
"Here's what I want to do - I'll send you a live preview link where you can see exactly how this works. You can test it yourself, see the QR code in action, and decide if it makes sense for your business. Sound fair?"
```

### **Close (15 seconds)**
```
"What's your email address so I can send you the preview link? I'll follow up in 48 hours to see how it's working for you."
```

## 📧 **Email Follow-Up Sequence**

### **Email 1: Live Preview Link (Immediate)**
```
Subject: Live Preview: Your QR Code System (Joe's Plumbing)

Hey Joe,

Thanks for the quick call! As promised, here's your live preview link:

🔗 [Gamma URL: acme-gamma.bizbox.host]

This is exactly what your QR code system will look like. You can:
- See the custom QR code in action
- Test the mobile experience
- View sample ad cards for your business
- Experience the full customer journey

The $49 starter package includes:
✅ Custom QR code generation
✅ 7-day live preview
✅ Mobile responsive design
✅ Email support
✅ 24-hour delivery

If you're ready to get started, just reply with "YES" and I'll set everything up for you.

If you have any questions, just call me back at [phone number].

Talk soon,
[Your Name]
AdTopia.io
```

### **Email 2: Follow-Up (48 hours later)**
```
Subject: How's the preview working? (Joe's Plumbing)

Hey Joe,

I wanted to follow up on the preview link I sent you yesterday.

Have you had a chance to test it out? I'm curious what you think about the QR code system.

Most of my clients get 3-5 extra jobs in the first month with this system. That's $300-500 in revenue for a $49 investment.

If you're ready to get started, just reply with "YES" and I'll have your system live within 24 hours.

If you have questions or concerns, I'm here to help. Just call me at [phone number].

Best,
[Your Name]
AdTopia.io
```

### **Email 3: Final Push (7 days later)**
```
Subject: Last chance for 60% off (Joe's Plumbing)

Hey Joe,

I wanted to give you one final heads up about the QR code system.

The 60% off beta pricing expires in 48 hours, and I only have 3 spots left for this month.

After that, the price goes back to $297 for the full package.

If you want to secure your spot at the beta price, just reply with "YES" and I'll get you set up immediately.

This is the last email I'll send about this, so if you're interested, now's the time.

Call me if you have any questions: [phone number]

Best,
[Your Name]
AdTopia.io
```

## 🎯 **Objection Handling**

### **"I need to think about it"**
```
"I understand you want to think it over. But here's the thing - every day you wait is another day your competitors are getting ahead. The $49 option is risk-free. If it doesn't get you at least 2 extra calls in the first week, I'll refund every penny. What do you have to lose?"
```

### **"It's too expensive"**
```
"Joe, let's do the math. The $49 option costs less than your monthly phone bill. If it gets you just one extra job, it's paid for itself. Most of my clients get 3-5 extra jobs in the first month. That's $300-500 in revenue for a $49 investment. Does that sound expensive to you?"
```

### **"I don't understand technology"**
```
"That's exactly why you need this, Joe. You don't need to understand it - I handle everything. You just put the QR code on your materials and watch the calls come in. It's so simple, my 12-year-old nephew could use it."
```

### **"I already have a website"**
```
"Great! This works with your existing website. The QR code just makes it easier for people to find you. Instead of typing in your web address, they just scan the code and instantly get to your site. It's like having a shortcut to your business."
```

### **"I'm not sure it will work for my business"**
```
"That's why I'm offering the preview first. You can test it yourself, see how it works, and decide if it makes sense. If it doesn't work for your business, you haven't lost anything. But if it does work, you've just found a new way to get customers."
```

## 📊 **Lead Tracking System**

### **CRM Setup**
```javascript
// Lead tracking in Supabase
const trackLead = async (leadData) => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: leadData.name,
      business: leadData.business,
      email: leadData.email,
      phone: leadData.phone,
      business_type: leadData.businessType,
      status: 'contacted',
      source: 'cold_call',
      created_at: new Date().toISOString()
    });
  
  return data;
};
```

### **Follow-Up Schedule**
- **Day 0**: Initial cold call
- **Day 0**: Send preview link email
- **Day 2**: Follow-up call/email
- **Day 7**: Final push email
- **Day 14**: Check-in call
- **Day 30**: Long-term follow-up

### **Conversion Tracking**
```javascript
// Track conversion events
const trackConversion = async (eventType, leadId, data) => {
  await supabase
    .from('conversion_events')
    .insert({
      lead_id: leadId,
      event_type: eventType,
      data: data,
      created_at: new Date().toISOString()
    });
};

// Event types
const events = {
  'preview_sent': 'Preview link sent',
  'preview_viewed': 'Preview link viewed',
  'questionnaire_started': 'Questionnaire started',
  'questionnaire_completed': 'Questionnaire completed',
  'checkout_initiated': 'Checkout initiated',
  'purchase_completed': 'Purchase completed'
};
```

## 🎯 **Success Metrics**

### **Daily Targets**
- **Calls made**: 20-30 per day
- **Emails sent**: 50-100 per day
- **Preview links sent**: 10-15 per day
- **Follow-ups**: 20-30 per day

### **Weekly Targets**
- **New leads**: 100-150 per week
- **Preview views**: 50-75 per week
- **Questionnaire completions**: 20-30 per week
- **Sales**: 5-10 per week

### **Monthly Targets**
- **Total leads**: 400-600 per month
- **Conversions**: 20-40 per month
- **Revenue**: $2,500-5,000 per month
- **Growth rate**: 20% month-over-month

## 🚀 **Scaling Strategy**

### **Phase 1: Local Market (Month 1)**
- **Target**: Local service businesses in your area
- **Method**: Cold calls and emails
- **Goal**: 20-30 sales, $2,500 revenue

### **Phase 2: Regional Expansion (Month 2)**
- **Target**: Expand to neighboring cities
- **Method**: Partner with local business associations
- **Goal**: 40-60 sales, $5,000 revenue

### **Phase 3: National Scale (Month 3+)**
- **Target**: National market via digital marketing
- **Method**: Google Ads, social media, partnerships
- **Goal**: 100+ sales, $10,000+ revenue

## 🎉 **The Complete Flow**

### **Step 1: Tease**
- **Cold call** with live preview hook
- **Send Gamma link** with custom experience
- **Track engagement** and interest level

### **Step 2: Heart**
- **Client views** ad card gallery
- **Hearts favorites** for customization
- **Questionnaire** provides lead scoring

### **Step 3: Review**
- **Admin dashboard** shows lead details
- **Bulk approve** qualified leads
- **Follow up** with personalized approach

### **Step 4: Close**
- **Stripe checkout** with upsells
- **Trust badges** and guarantees
- **6-8% conversion** rate target

### **Step 5: Deliver**
- **Custom subdomain** (acme.bizbox.host)
- **Email confirmation** with next steps
- **24-hour delivery** guarantee

**This creates the perfect dopamine trap: Live tease → Interactive review → Instant unlock. Ready for execution!**
