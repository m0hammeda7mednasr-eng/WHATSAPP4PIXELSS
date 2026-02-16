# 🧪 Testing Guide - Multi-Tenant WhatsApp CRM

## 🔍 How to Test

### 1. Open the App
👉 **http://localhost:5177/**

### 2. Open Browser Console
- Press **F12** (Windows) or **Cmd+Option+I** (Mac)
- Go to **Console** tab
- You should see logs like:
  ```
  📥 Fetching brands...
  ✅ Loaded 2 brands: ['4 Pixels', 'Lamsa']
  🎯 Setting default brand: 4 Pixels
  📥 Fetching contacts for brand: 4 Pixels
  ✅ Loaded 3 contacts
  ```

### 3. Login
- Email: `moh@gmail.com`
- Password: `01066184859`

**Check console for:**
```
✅ User logged in
📥 Fetching brands...
```

### 4. Check Brand Switcher
- You should see **"4 Pixels"** in the sidebar
- Click on it to see dropdown with **"Lamsa"**

**Check console for:**
```
🔄 Switching to brand: Lamsa
📥 Fetching contacts for brand: Lamsa
```

### 5. Select a Contact
- Click on **"John Doe"** or any contact

**Check console for:**
```
📥 Fetching messages for: {contact: 'John Doe', brand: '4 Pixels'}
✅ Loaded X messages
```

### 6. Send a Message
- Type: "Test message"
- Click Send

**Check console for:**
```
📤 Sending message... {contact: 'John Doe', brand: '4 Pixels', message: 'Test message'}
📝 Inserting message: {contact_id: '...', brand_id: '...', ...}
✅ Message inserted: [{...}]
```

**The message should appear in the chat immediately!**

---

## ❌ Common Issues & Solutions

### Issue 1: "No brands available"
**Solution:**
```bash
node fix-and-test.js
```

### Issue 2: "No contacts found"
**Solution:**
Check if contacts have brand_id:
```bash
node fix-and-test.js
```

### Issue 3: Message not sending
**Check console for errors:**
- ❌ "Supabase error: ..." → Check RLS policies
- ❌ "brand_id is null" → Run fix-and-test.js
- ❌ "contact_id is null" → Select a contact first

**Fix RLS policies:**
```sql
-- Run in Supabase SQL Editor
DROP POLICY IF EXISTS "Allow authenticated users to insert messages" ON messages;
CREATE POLICY "Allow authenticated users to insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### Issue 4: Messages not appearing
**Check:**
1. Open Console → Network tab
2. Look for "realtime" connections
3. Should see WebSocket connection to Supabase

**Fix:**
- Refresh the page
- Check Supabase project is active
- Check internet connection

---

## 🔧 Debug Commands

### Check Database:
```bash
node fix-and-test.js
```

### Check Brands:
```sql
SELECT * FROM brands;
```

### Check Contacts:
```sql
SELECT c.*, b.name as brand_name 
FROM contacts c 
LEFT JOIN brands b ON c.brand_id = b.id;
```

### Check Messages:
```sql
SELECT m.*, c.name as contact_name, b.name as brand_name
FROM messages m
LEFT JOIN contacts c ON m.contact_id = c.id
LEFT JOIN brands b ON m.brand_id = b.id
ORDER BY m.created_at DESC
LIMIT 10;
```

---

## ✅ Expected Behavior

### When you open the app:
1. ✅ Brands load automatically
2. ✅ First brand is selected by default
3. ✅ Contacts for that brand appear
4. ✅ You can switch brands
5. ✅ Contacts update when switching

### When you select a contact:
1. ✅ Messages load for that contact
2. ✅ Messages are filtered by current brand
3. ✅ Real-time updates work
4. ✅ You can send messages

### When you send a message:
1. ✅ Message appears immediately in chat
2. ✅ Message is saved to database
3. ✅ Status shows as "sent" (✓)
4. ✅ Supabase webhook triggers (if configured)
5. ✅ n8n receives the message (if configured)

---

## 📊 Test Checklist

- [ ] App loads without errors
- [ ] Brands appear in dropdown
- [ ] Can switch between brands
- [ ] Contacts load for each brand
- [ ] Can select a contact
- [ ] Messages load for contact
- [ ] Can type in input field
- [ ] Can send a message
- [ ] Message appears in chat
- [ ] Message has timestamp
- [ ] Message has status icon (✓)
- [ ] Real-time updates work
- [ ] Can logout
- [ ] Can login again

---

## 🎯 Next Steps

If everything works:
1. ✅ Setup Supabase Webhook (see MULTI-TENANT-GUIDE.md)
2. ✅ Configure n8n workflows
3. ✅ Test with real WhatsApp messages

If something doesn't work:
1. Check browser console for errors
2. Run `node fix-and-test.js`
3. Check Supabase logs
4. Check RLS policies

---

## 📞 Support

**Console shows errors?**
- Copy the error message
- Check the error type
- Follow the solutions above

**Still not working?**
- Check `.env` file has correct Supabase credentials
- Check Supabase project is active
- Check internet connection
- Restart the dev server

---

## 🎉 Success!

If you see:
```
✅ Message inserted: [{...}]
```

And the message appears in the chat → **Everything is working!** 🚀
