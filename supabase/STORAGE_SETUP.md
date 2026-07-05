# Supabase Storage Setup for Event & Kajian Images

## 📋 Setup Instructions

To enable image uploads for events and kajian, you need to run the SQL migration to create the storage bucket and policies.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `supabase/storage_events.sql`
5. Click **Run** to execute the SQL

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run the SQL file directly
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/storage_events.sql
```

## 🔐 Storage Bucket Details

- **Bucket Name**: `event-images` (shared for both events and kajian)
- **Max File Size**: 1 MB (1,048,576 bytes)
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Public Access**: Yes (images are publicly viewable)

## 🔒 Security Policies

The following Row Level Security (RLS) policies are automatically created:

1. **Public Read**: Anyone can view event/kajian images
2. **Authenticated Upload**: Only logged-in users can upload images
3. **Authenticated Update**: Only logged-in users can update images
4. **Authenticated Delete**: Only logged-in users can delete images

## 📁 File Structure

Uploaded images will be stored with this structure:
```
event-images/
  ├── events/
  │   ├── 1234567890-abc123.jpg
  │   ├── 1234567891-def456.png
  │   └── ...
  └── kajian/
      ├── 1234567892-ghi789.jpg
      ├── 1234567893-jkl012.png
      └── ...
```

## 🔗 Public URL Format

After upload, images will be accessible via:
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/event-images/events/[filename]
https://[PROJECT_REF].supabase.co/storage/v1/object/public/event-images/kajian/[filename]
```

## ✅ Verification

To verify the setup was successful:

1. Go to **Storage** in Supabase Dashboard
2. You should see `event-images` bucket
3. Click on it to see the `events` and `kajian` folders
4. Try uploading an image through your Events or Kajian page

## 🐛 Troubleshooting

### Error: "bucket_id violates foreign key constraint"
- The bucket hasn't been created yet. Run the SQL migration again.

### Error: "new row violates row-level security policy"
- Make sure you're logged in when uploading
- Check if RLS policies are properly created

### Error: "File size exceeds the allowed limit"
- Maximum file size is 1 MB
- Compress your image or choose a smaller file

### Error: "Invalid file type"
- Only JPEG, JPG, PNG, and WebP formats are allowed
- Convert your image to a supported format

## 📝 Notes

- Images are automatically optimized on upload
- Old images are NOT automatically deleted when updating an event/kajian
- You can manually delete unused images from the Storage dashboard
- Consider implementing automatic cleanup for unused images in production
- Both Events and Kajian share the same bucket for better resource management
