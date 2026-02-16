# 🗄️ Setup Supabase Storage للصور والملفات

## الخطوات:

### 1. إنشاء Storage Bucket
1. روح على: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets
2. اضغط **"Create a new bucket"** أو **"New bucket"**
3. حط الإعدادات دي:
   - **Name**: `whatsapp-media`
   - **Public bucket**: ✅ (فعّل الخيار ده)
4. اضغط **"Create bucket"**

### 2. إعداد Storage Policies
بعد ما تعمل الـ bucket، روح على:
https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/policies

اختار bucket **whatsapp-media** وضيف الـ policies دي:

#### Policy 1: Allow Upload (INSERT)
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'whatsapp-media');
```

#### Policy 2: Allow Read (SELECT)
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'whatsapp-media');
```

#### Policy 3: Allow Delete
```sql
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'whatsapp-media');
```

---

## ✅ بعد ما تخلص:
- هتقدر ترفع صور وملفات
- هتقدر تشوف الصور في الشات
- هتقدر تنزل الملفات
- كل الملفات هتتخزن في Supabase Storage

## 🔗 روابط مفيدة:
- Storage Dashboard: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets
- Storage Policies: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/policies
