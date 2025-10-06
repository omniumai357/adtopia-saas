# 🎛️ Admin Dashboard - Lead Management System

## 🏗️ **Dashboard Architecture**

### **Sidebar Navigation**
```html
<div class="sidebar bg-gray-900 text-white w-64 min-h-screen">
  <div class="p-6">
    <h1 class="text-2xl font-bold">BizBox Admin</h1>
    <div class="mt-8 space-y-2">
      <a href="#leads" class="sidebar-link flex items-center p-3 rounded-lg hover:bg-gray-800">
        <span class="mr-3">📊</span>
        Leads Dashboard
      </a>
      <a href="#workflows" class="sidebar-link flex items-center p-3 rounded-lg hover:bg-gray-800">
        <span class="mr-3">⚡</span>
        Workflows
      </a>
      <a href="#gallery" class="sidebar-link flex items-center p-3 rounded-lg hover:bg-gray-800">
        <span class="mr-3">🎨</span>
        Ad Gallery
      </a>
      <a href="#analytics" class="sidebar-link flex items-center p-3 rounded-lg hover:bg-gray-800">
        <span class="mr-3">📈</span>
        Analytics
      </a>
      <a href="#settings" class="sidebar-link flex items-center p-3 rounded-lg hover:bg-gray-800">
        <span class="mr-3">⚙️</span>
        Settings
      </a>
    </div>
  </div>
</div>
```

## 📊 **Leads Dashboard**

### **Lead Overview Cards**
```html
<div class="dashboard-grid grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
  <!-- Total Leads -->
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">Total Leads</p>
        <p class="text-3xl font-bold text-gray-900">1,247</p>
      </div>
      <div class="text-green-500 text-2xl">📈</div>
    </div>
    <div class="mt-4">
      <span class="text-green-600 text-sm">+12% from last week</span>
    </div>
  </div>

  <!-- Qualified Leads -->
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">Qualified</p>
        <p class="text-3xl font-bold text-blue-600">89</p>
      </div>
      <div class="text-blue-500 text-2xl">🎯</div>
    </div>
    <div class="mt-4">
      <span class="text-blue-600 text-sm">7.1% conversion rate</span>
    </div>
  </div>

  <!-- Pending Review -->
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">Pending</p>
        <p class="text-3xl font-bold text-yellow-600">23</p>
      </div>
      <div class="text-yellow-500 text-2xl">⏳</div>
    </div>
    <div class="mt-4">
      <span class="text-yellow-600 text-sm">Needs review</span>
    </div>
  </div>

  <!-- Revenue -->
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">Revenue</p>
        <p class="text-3xl font-bold text-green-600">$2,847</p>
      </div>
      <div class="text-green-500 text-2xl">💰</div>
    </div>
    <div class="mt-4">
      <span class="text-green-600 text-sm">This week</span>
    </div>
  </div>
</div>
```

### **Lead List with Bulk Actions**
```html
<div class="bg-white rounded-lg shadow m-6">
  <div class="p-6 border-b border-gray-200">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Recent Leads</h2>
      <div class="flex space-x-2">
        <button class="bulk-action-btn bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Bulk Approve
        </button>
        <button class="bulk-action-btn bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700">
          Bulk Pause
        </button>
        <button class="bulk-action-btn bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
          Bulk Reject
        </button>
      </div>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <input type="checkbox" class="select-all-checkbox">
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Lead
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Business Type
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Lead Score
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <!-- Lead Row 1 -->
        <tr class="lead-row hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <input type="checkbox" class="lead-checkbox" data-lead-id="1">
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  J
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">Joe Smith</div>
                <div class="text-sm text-gray-500">joe@acmeplumbing.com</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Plumbing
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 85%"></div>
              </div>
              <span class="text-sm text-gray-900">85%</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending Review
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button class="action-btn text-blue-600 hover:text-blue-900" data-action="approve" data-lead-id="1">
                Approve
              </button>
              <button class="action-btn text-yellow-600 hover:text-yellow-900" data-action="pause" data-lead-id="1">
                Pause
              </button>
              <button class="action-btn text-red-600 hover:text-red-900" data-action="reject" data-lead-id="1">
                Reject
              </button>
            </div>
          </td>
        </tr>

        <!-- Lead Row 2 -->
        <tr class="lead-row hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <input type="checkbox" class="lead-checkbox" data-lead-id="2">
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                  M
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">Maria Garcia</div>
                <div class="text-sm text-gray-500">maria@eliteelectric.com</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Electrical
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 92%"></div>
              </div>
              <span class="text-sm text-gray-900">92%</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Approved
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button class="action-btn text-blue-600 hover:text-blue-900" data-action="view" data-lead-id="2">
                View
              </button>
              <button class="action-btn text-green-600 hover:text-green-900" data-action="contact" data-lead-id="2">
                Contact
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

## ⚡ **Workflows Management**

### **Workflow Builder**
```html
<div class="bg-white rounded-lg shadow m-6 p-6">
  <h2 class="text-xl font-semibold mb-6">Lead Workflows</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- New Lead Workflow -->
    <div class="workflow-card border-2 border-gray-200 rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-4">New Lead Workflow</h3>
      <div class="space-y-3">
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            1
          </div>
          <div>
            <div class="font-medium">Lead submits questionnaire</div>
            <div class="text-sm text-gray-600">Auto-triggered</div>
          </div>
        </div>
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            2
          </div>
          <div>
            <div class="font-medium">Calculate lead score</div>
            <div class="text-sm text-gray-600">Based on responses</div>
          </div>
        </div>
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            3
          </div>
          <div>
            <div class="font-medium">Send preview link</div>
            <div class="text-sm text-gray-600">Email automation</div>
          </div>
        </div>
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            4
          </div>
          <div>
            <div class="font-medium">Admin review</div>
            <div class="text-sm text-gray-600">Manual approval</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Follow-up Workflow -->
    <div class="workflow-card border-2 border-gray-200 rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-4">Follow-up Workflow</h3>
      <div class="space-y-3">
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            1
          </div>
          <div>
            <div class="font-medium">Lead approved</div>
            <div class="text-sm text-gray-600">Admin action</div>
          </div>
        </div>
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            2
          </div>
          <div>
            <div class="font-medium">Send gallery link</div>
            <div class="text-sm text-gray-600">Email automation</div>
          </div>
        </div>
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            3
          </div>
          <div>
            <div class="font-medium">Track engagement</div>
            <div class="text-sm text-gray-600">Analytics</div>
          </div>
        </div>
        <div class="workflow-step flex items-center">
          <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            4
          </div>
          <div>
            <div class="font-medium">Follow up call</div>
            <div class="text-sm text-gray-600">Manual action</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 🎨 **Ad Gallery Management**

### **Gallery Overview**
```html
<div class="bg-white rounded-lg shadow m-6 p-6">
  <h2 class="text-xl font-semibold mb-6">Ad Gallery Management</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <!-- Gallery Stats -->
    <div class="stat-card bg-blue-50 p-4 rounded-lg">
      <div class="text-2xl font-bold text-blue-600">60</div>
      <div class="text-sm text-gray-600">Total Cards</div>
    </div>
    <div class="stat-card bg-green-50 p-4 rounded-lg">
      <div class="text-2xl font-bold text-green-600">1,247</div>
      <div class="text-sm text-gray-600">Total Views</div>
    </div>
    <div class="stat-card bg-purple-50 p-4 rounded-lg">
      <div class="text-2xl font-bold text-purple-600">89</div>
      <div class="text-sm text-gray-600">Hearts Given</div>
    </div>
  </div>

  <!-- Gallery Categories -->
  <div class="space-y-4">
    <div class="category-section">
      <h3 class="text-lg font-semibold mb-3">Core ACME/Construction (20 cards)</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="gallery-item border-2 border-gray-200 rounded-lg p-3 text-center">
          <div class="w-full h-24 bg-gray-100 rounded mb-2"></div>
          <div class="text-sm font-medium">ACME Construction</div>
          <div class="text-xs text-gray-600">23 views</div>
        </div>
        <div class="gallery-item border-2 border-gray-200 rounded-lg p-3 text-center">
          <div class="w-full h-24 bg-gray-100 rounded mb-2"></div>
          <div class="text-sm font-medium">Elite Plumbing</div>
          <div class="text-xs text-gray-600">18 views</div>
        </div>
        <!-- Add more cards... -->
      </div>
    </div>

    <div class="category-section">
      <h3 class="text-lg font-semibold mb-3">Gamma Holidays (20 cards)</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="gallery-item border-2 border-gray-200 rounded-lg p-3 text-center">
          <div class="w-full h-24 bg-gray-100 rounded mb-2"></div>
          <div class="text-sm font-medium">Christmas Special</div>
          <div class="text-xs text-gray-600">31 views</div>
        </div>
        <div class="gallery-item border-2 border-gray-200 rounded-lg p-3 text-center">
          <div class="w-full h-24 bg-gray-100 rounded mb-2"></div>
          <div class="text-sm font-medium">Summer Sale</div>
          <div class="text-xs text-gray-600">27 views</div>
        </div>
        <!-- Add more cards... -->
      </div>
    </div>

    <div class="category-section">
      <h3 class="text-lg font-semibold mb-3">Promo Cards (20 cards)</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="gallery-item border-2 border-gray-200 rounded-lg p-3 text-center">
          <div class="w-full h-24 bg-gray-100 rounded mb-2"></div>
          <div class="text-sm font-medium">50% Off Sale</div>
          <div class="text-xs text-gray-600">35 views</div>
        </div>
        <div class="gallery-item border-2 border-gray-200 rounded-lg p-3 text-center">
          <div class="w-full h-24 bg-gray-100 rounded mb-2"></div>
          <div class="text-sm font-medium">Free Consultation</div>
          <div class="text-xs text-gray-600">29 views</div>
        </div>
        <!-- Add more cards... -->
      </div>
    </div>
  </div>
</div>
```

## 📈 **Analytics Dashboard**

### **Performance Metrics**
```html
<div class="bg-white rounded-lg shadow m-6 p-6">
  <h2 class="text-xl font-semibold mb-6">Analytics Dashboard</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Conversion Funnel -->
    <div class="funnel-chart">
      <h3 class="text-lg font-semibold mb-4">Conversion Funnel</h3>
      <div class="space-y-4">
        <div class="funnel-step">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Gamma Site Visitors</span>
            <span class="text-sm text-gray-600">1,247</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: 100%"></div>
          </div>
        </div>
        <div class="funnel-step">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Questionnaire Completed</span>
            <span class="text-sm text-gray-600">498</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: 40%"></div>
          </div>
        </div>
        <div class="funnel-step">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Gallery Viewed</span>
            <span class="text-sm text-gray-600">249</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-yellow-600 h-2 rounded-full" style="width: 20%"></div>
          </div>
        </div>
        <div class="funnel-step">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Cards Hearted</span>
            <span class="text-sm text-gray-600">89</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full" style="width: 7%"></div>
          </div>
        </div>
        <div class="funnel-step">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Purchases</span>
            <span class="text-sm text-gray-600">23</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-red-600 h-2 rounded-full" style="width: 2%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue Chart -->
    <div class="revenue-chart">
      <h3 class="text-lg font-semibold mb-4">Revenue Trend</h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-sm">This Week</span>
          <span class="text-sm font-semibold text-green-600">$2,847</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm">Last Week</span>
          <span class="text-sm font-semibold text-gray-600">$2,134</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm">This Month</span>
          <span class="text-sm font-semibold text-blue-600">$8,921</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm">Last Month</span>
          <span class="text-sm font-semibold text-gray-600">$6,543</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## ⚙️ **Settings & Configuration**

### **System Settings**
```html
<div class="bg-white rounded-lg shadow m-6 p-6">
  <h2 class="text-xl font-semibold mb-6">System Settings</h2>
  
  <div class="space-y-6">
    <!-- Email Settings -->
    <div class="setting-section">
      <h3 class="text-lg font-semibold mb-3">Email Configuration</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">From Email</label>
          <input type="email" value="noreply@adtopia.io" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Support Email</label>
          <input type="email" value="beta@bizbox.host" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
        </div>
      </div>
    </div>

    <!-- Stripe Settings -->
    <div class="setting-section">
      <h3 class="text-lg font-semibold mb-3">Stripe Configuration</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Webhook Secret</label>
          <input type="password" value="whsec_..." class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Success URL</label>
          <input type="url" value="https://bizbox.host/success" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
        </div>
      </div>
    </div>

    <!-- Lead Scoring -->
    <div class="setting-section">
      <h3 class="text-lg font-semibold mb-3">Lead Scoring Rules</h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm">Business Type: Plumbing</span>
          <span class="text-sm font-semibold text-blue-600">+20 points</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">Current Marketing: Google Ads</span>
          <span class="text-sm font-semibold text-blue-600">+15 points</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">Goal: More Calls</span>
          <span class="text-sm font-semibold text-blue-600">+25 points</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">Bilingual Support</span>
          <span class="text-sm font-semibold text-blue-600">+10 points</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 🚀 **Command Menu Integration**

### **Keyboard Shortcuts**
```javascript
// Command menu for bulk actions
const commandMenu = {
  'Cmd+K': 'Open command menu',
  'Cmd+A': 'Select all leads',
  'Cmd+Enter': 'Bulk approve selected',
  'Cmd+Shift+P': 'Bulk pause selected',
  'Cmd+Shift+R': 'Bulk reject selected',
  'Cmd+F': 'Search leads',
  'Cmd+G': 'Go to gallery',
  'Cmd+Shift+A': 'Go to analytics'
};
```

### **Bulk Actions**
```javascript
// Bulk action handlers
const bulkActions = {
  approve: (leadIds) => {
    // Update lead status to approved
    // Send approval email
    // Trigger follow-up workflow
  },
  pause: (leadIds) => {
    // Update lead status to paused
    // Send pause notification
    // Schedule follow-up
  },
  reject: (leadIds) => {
    // Update lead status to rejected
    // Send rejection email
    // Archive lead
  }
};
```

## 🎯 **Implementation Notes**

### **Database Schema**
```sql
-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  business_type TEXT,
  lead_score INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead responses table
CREATE TABLE lead_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  question TEXT,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery interactions table
CREATE TABLE gallery_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  card_id TEXT,
  action TEXT, -- 'view', 'heart', 'unheart'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **API Endpoints**
```javascript
// Lead management endpoints
GET /api/leads - Get all leads with filtering
POST /api/leads/bulk-approve - Bulk approve leads
POST /api/leads/bulk-pause - Bulk pause leads
POST /api/leads/bulk-reject - Bulk reject leads
GET /api/analytics/funnel - Get conversion funnel data
GET /api/analytics/revenue - Get revenue analytics
```

**This admin dashboard provides complete control over the lead management process, from initial contact to final conversion. Ready for implementation!**
