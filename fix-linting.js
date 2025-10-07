const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'app/admin/roles/page.tsx',
  'app/admin/stripe-logs/page.tsx',
  'app/pages/index.tsx',
  'app/pages/payment-success.tsx',
  'app/sandbox/payment-link-tester/page.tsx',
  'src/pages/PaymentSuccess.tsx'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix apostrophes in text content (not in code)
    content = content.replace(/([^\\])'([^']*[^\\])'/g, '$1&apos;$2&apos;');
    
    // Fix quotes in text content (not in code)
    content = content.replace(/([^\\])"([^"]*[^\\])"/g, '$1&quot;$2&quot;');
    
    // Fix specific React Hook dependency issues
    if (filePath.includes('admin/roles/page.tsx')) {
      content = content.replace(
        "import React, { useEffect, useState } from 'react';",
        "import React, { useEffect, useState, useCallback } from 'react';"
      );
      content = content.replace(
        'const fetchAdminUsers = async () => {',
        'const fetchAdminUsers = useCallback(async () => {'
      );
      content = content.replace(
        '  }, []);',
        '  }, [supabase]);'
      );
    }
    
    if (filePath.includes('admin/stripe-logs/page.tsx')) {
      content = content.replace(
        '  }, [supabase, page, pageSize, filter]);',
        '  }, [supabase, page, pageSize, filter, from, project, search, to]);'
      );
    }
    
    if (filePath.includes('pages/index.tsx')) {
      content = content.replace(
        "import React from 'react';\nimport Head from 'next/head';",
        "import React from 'react';\nimport Head from 'next/head';\nimport Image from 'next/image';"
      );
      content = content.replace(
        '<img\n                    src={image.image_url}\n                    alt={image.title}\n                    className="w-full h-48 object-cover"\n                  />',
        '<Image\n                    src={image.image_url}\n                    alt={image.title}\n                    width={400}\n                    height={192}\n                    className="w-full h-48 object-cover"\n                  />'
      );
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${filePath}`);
  }
});

console.log('Linting fixes applied!');
