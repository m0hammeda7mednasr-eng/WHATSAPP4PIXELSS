
// Quick Token Update Script
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rmpgofswkpjxionzythf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM'
);

async function quickUpdateToken() {
    // Replace this with your actual permanent token
    const NEW_TOKEN = 'PASTE_YOUR_PERMANENT_TOKEN_HERE';
    
    if (NEW_TOKEN === 'PASTE_YOUR_PERMANENT_TOKEN_HERE') {
        console.log('❌ Please replace NEW_TOKEN with your actual token');
        return;
    }
    
    const { error } = await supabase
        .from('brands')
        .update({ whatsapp_token: NEW_TOKEN })
        .eq('name', '4 Pixels');
        
    if (error) {
        console.error('❌ Update failed:', error);
    } else {
        console.log('✅ Token updated successfully!');
        console.log('✅ Test message sending now');
    }
}

quickUpdateToken();
