# Snapshot System Usage Guide

## Quick Start

### Create a Snapshot (Before Major Changes)

```bash
./create-snapshot-automated.sh
```

That's it! The script automatically:
- ✅ Creates git tag and pushes to remote
- ✅ Archives full codebase
- ✅ Creates deployment package
- ✅ Exports database schema (if tools available)
- ✅ Exports environment variables (if AWS CLI available)
- ✅ Creates rollback script

### Rollback to a Snapshot

```bash
cd snapshots/snapshot-YYYYMMDD-HHMMSS
./ROLLBACK.sh
```

Follow the prompts to revert code, deployment, and configuration.

---

## When to Create Snapshots

Create snapshots before:
- 🔴 **Major architecture changes** (like HIPAA migration)
- 🟡 **Database schema migrations**
- 🟡 **Deployment to production**
- 🟢 **Significant feature additions**

---

## What Gets Backed Up

### Automatic (No Manual Steps)
1. **Git State**
   - Current commit SHA
   - Branch name
   - Tagged snapshot (pushed to remote)

2. **Code**
   - Full codebase archive (excludes node_modules, .git)
   - Compressed tar.gz format

3. **Deployment Package**
   - Ready-to-deploy backend zip
   - Excludes development files

### Semi-Automatic (Fallback to Templates)
4. **Database Schema**
   - If `pg_dump` available: Full automated export
   - Otherwise: SQL template for manual export

5. **Environment Variables**
   - If `aws` CLI available: Full automated export
   - Otherwise: Template for manual export

---

## Snapshot Storage

Snapshots are stored in: `snapshots/snapshot-YYYYMMDD-HHMMSS/`

Each snapshot contains:
```
snapshot-20260120-154645/
├── git-info.txt                      # Git commit, branch, tag
├── codebase-backup.tar.gz            # Full code archive
├── staging-pre-hipaa-backup.zip      # Deployment package
├── database-schema-backup.sql        # DB schema export
├── env-backup-staging.txt            # Environment variables
├── ROLLBACK.sh                       # Automated rollback script
└── SNAPSHOT-INFO.txt                 # Snapshot metadata
```

---

## Rollback Process

### Full Rollback (Everything)

```bash
cd snapshots/snapshot-YYYYMMDD-HHMMSS
./ROLLBACK.sh
```

The script will:
1. Show you the snapshot details
2. Ask for confirmation
3. Reset git to the snapshot commit
4. Optionally push to remote
5. Provide instructions for deployment and env vars

### Partial Rollback (Code Only)

```bash
git checkout snapshot-before-hipaa-YYYYMMDD-HHMMSS
```

### Partial Rollback (Deployment Only)

Upload the deployment package from the snapshot:
```bash
snapshots/snapshot-YYYYMMDD-HHMMSS/staging-pre-hipaa-backup.zip
```

To AWS Elastic Beanstalk Console → Upload and deploy

---

## Verifying Snapshots

After creating a snapshot, verify it worked:

```bash
# Check git tag exists locally
git tag -l 'snapshot-before-hipaa-*'

# Check git tag exists remotely
git ls-remote --tags origin | grep snapshot-before-hipaa

# Check snapshot directory
ls -la snapshots/snapshot-YYYYMMDD-HHMMSS/

# Verify files
cat snapshots/snapshot-YYYYMMDD-HHMMSS/SNAPSHOT-INFO.txt
```

---

## Advanced Usage

### Manual Database Export (if automated fails)

If the automated database export didn't work:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL from: `snapshots/snapshot-YYYYMMDD-HHMMSS/database-schema-backup.sql`
3. Run the queries
4. Save output to the same file

### Manual Environment Variables Export (if automated fails)

If AWS CLI isn't available:

1. Go to AWS Elastic Beanstalk Console
2. Select environment → Configuration → Software
3. Copy all environment variables
4. Save to: `snapshots/snapshot-YYYYMMDD-HHMMSS/env-backup-staging.txt`

Repeat for AWS Amplify environment variables.

---

## Snapshot Retention

**Recommended retention:**
- Keep snapshots for 30 days after successful migration
- Keep pre-production snapshots until production is stable
- Archive important snapshots to external storage (Dropbox, S3, etc.)

**Cleanup old snapshots:**
```bash
# Delete snapshot directory
rm -rf snapshots/snapshot-YYYYMMDD-HHMMSS

# Delete git tag (local)
git tag -d snapshot-before-hipaa-YYYYMMDD-HHMMSS

# Delete git tag (remote)
git push origin :refs/tags/snapshot-before-hipaa-YYYYMMDD-HHMMSS
```

---

## Troubleshooting

### "pg_dump: command not found"

Install PostgreSQL client:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Or use manual export template in the snapshot
```

### "aws: command not found"

Install AWS CLI:
```bash
# macOS
brew install awscli

# Or use manual export template in the snapshot
```

### Rollback failed - git issues

If `ROLLBACK.sh` fails:
```bash
# Check git reflog
git reflog

# Manually reset to snapshot
git reset --hard <snapshot-commit-sha>
```

### Can't find snapshot commit

Git tags are permanent references:
```bash
# Find the tag
git tag -l 'snapshot-before-hipaa-*'

# Checkout the tag
git checkout snapshot-before-hipaa-YYYYMMDD-HHMMSS
```

---

## Best Practices

1. **Always snapshot before major changes**
2. **Verify snapshots immediately after creation**
3. **Test rollback process on a test change first**
4. **Keep snapshots until changes are stable**
5. **Archive critical snapshots externally**
6. **Document why you created each snapshot**

---

## Example Workflow

```bash
# 1. Before HIPAA migration
./create-snapshot-automated.sh

# 2. Verify snapshot created
cat snapshots/snapshot-*/SNAPSHOT-INFO.txt

# 3. Make changes (implement HIPAA architecture)
# ... development work ...

# 4. Test in staging
# ... testing ...

# 5. If something goes wrong, rollback:
cd snapshots/snapshot-20260120-154645
./ROLLBACK.sh

# 6. If everything works, keep snapshot for 30 days
# Then clean up
```

---

This automated system makes snapshots quick and reliable, with minimal manual steps.
