# Fix Database Connection Issue

## Problem Detected

Your database connection is failing with: `getaddrinfo ENOTFOUND db.mjjvgyjhqhtlsdfwowjf.supabase.co`

This means:
1. ❌ The Supabase project might be paused or inactive
2. ❌ The hostname in your DATABASE_URL might be incorrect
3. ⚠️  Your password contains special characters that need URL encoding

## Solution Steps

### Step 1: Check Your Supabase Project

1. Go to: https://supabase.com/dashboard
2. Look for your project in the list
3. Check the project status:
   - ✅ **Active** (green) - Project is running
   - ⏸️ **Paused** (yellow) - Project is paused (common for free tier after inactivity)
   - ❌ **Inactive** - Project needs to be restored

4. **If paused:** Click on the project and click "Restore" or "Resume"
5. Wait 1-2 minutes for the project to become active

### Step 2: Get the Correct Connection String

1. In your Supabase dashboard, select your project
2. Go to: **Settings** → **Database**
3. Scroll down to **Connection string**
4. Select **URI** format (not the .env format)
5. You'll see something like:
   ```
   postgresql://postgres.[project-ref]:[password]@[host]:5432/postgres
   ```

6. Click the **Copy** button (it will show the actual password)

### Step 3: URL-Encode Your Password

Your current password is: `TK&ENM46Qrt%Z7E`

The special characters `&` and `%` need to be URL-encoded:
- `&` should be `%26`
- `%` should be `%25`

So your password becomes: `TK%26ENM46Qrt%25Z7E`

### Step 4: Update Your .env File

Open `backend/.env` and replace the DATABASE_URL line with:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PROJECT-REF]:TK%26ENM46Qrt%25Z7E@[CORRECT-HOST]:5432/postgres
```

**Important:** Replace `[YOUR-PROJECT-REF]` and `[CORRECT-HOST]` with the actual values from Supabase.

The host should look like: `aws-0-us-east-1.pooler.supabase.com` or `db.xxxxx.supabase.co`

### Step 5: Test the Connection Again

```bash
node test-db-connection.js
```

You should see:
```
✅ Successfully connected to database!
📊 PostgreSQL Version: ...
✨ Database connection test passed!
```

### Step 6: Run the Migration

Once the connection test passes:

```bash
node migrate.js
```

You should see:
```
✅ Database migration completed successfully!
📋 Tables created:
   - audits (with indexes on created_at and is_paid)
✨ Your database is ready to use!
```

---

## Common Issues

### Issue: "Project is paused"
**Solution:** Resume the project in Supabase dashboard. Free tier projects pause after 1 week of inactivity.

### Issue: "Invalid password"
**Solution:** Make sure you URL-encoded the special characters (`&` → `%26`, `%` → `%25`)

### Issue: "Connection timeout"
**Solution:** Check your internet connection and firewall settings

### Issue: "SSL certificate error"
**Solution:** Our code already handles this with `ssl: { rejectUnauthorized: false }`

---

## Alternative: Get a Fresh Connection String

If you're still having issues, the easiest solution is to:

1. Go to Supabase Dashboard
2. Settings → Database
3. **Reset your database password** (choose a simple password without special characters)
4. Copy the new connection string (URI format)
5. Paste it directly into `backend/.env`

Example of a simple password: `MyPassword123` (no special characters)

---

## Need More Help?

After following these steps, run:
```bash
node test-db-connection.js
```

If it still fails, share the error message and I'll help debug further.
