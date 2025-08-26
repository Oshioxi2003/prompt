#!/usr/bin/env python3
"""
Script to migrate data from SQLite to MySQL
Usage: python migrate_sqlite_to_mysql.py
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prompt_library.settings')
django.setup()

from django.core.management.commands.dumpdata import Command as DumpDataCommand
from django.core.management.commands.loaddata import Command as LoadDataCommand
from django.db import connections
import json

def backup_sqlite_data():
    """Backup all data from SQLite database"""
    print("📦 Backing up SQLite data...")
    
    # Create backup directory
    backup_dir = "backup"
    os.makedirs(backup_dir, exist_ok=True)
    
    # Dump all data except contenttypes and auth.permission
    apps_to_backup = [
        'prompts.Category',
        'prompts.Tag', 
        'prompts.Prompt',
        'prompts.User',
        'prompts.ContactMessage',
        'admin.LogEntry',
        'sessions.Session',
    ]
    
    for app_model in apps_to_backup:
        try:
            filename = f"{backup_dir}/{app_model.replace('.', '_')}.json"
            print(f"  → Backing up {app_model} to {filename}")
            
            execute_from_command_line([
                'manage.py', 'dumpdata', app_model, 
                '--output', filename,
                '--indent', '2'
            ])
        except Exception as e:
            print(f"  ⚠️  Warning: Could not backup {app_model}: {e}")
    
    print("✅ SQLite backup completed!")

def setup_mysql_database():
    """Setup MySQL database with migrations"""
    print("🔧 Setting up MySQL database...")
    
    try:
        # Run migrations
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ MySQL migrations completed!")
        
    except Exception as e:
        print(f"❌ Error setting up MySQL: {e}")
        return False
    
    return True

def restore_data_to_mysql():
    """Restore data to MySQL database"""
    print("📥 Restoring data to MySQL...")
    
    backup_dir = "backup"
    
    # Load data in specific order to handle dependencies
    load_order = [
        'prompts_User.json',
        'prompts_Category.json', 
        'prompts_Tag.json',
        'prompts_Prompt.json',
        'prompts_ContactMessage.json',
        'admin_LogEntry.json',
        'sessions_Session.json',
    ]
    
    for filename in load_order:
        filepath = os.path.join(backup_dir, filename)
        if os.path.exists(filepath):
            try:
                print(f"  → Loading {filename}")
                execute_from_command_line(['manage.py', 'loaddata', filepath])
            except Exception as e:
                print(f"  ⚠️  Warning: Could not load {filename}: {e}")
        else:
            print(f"  ⚠️  File not found: {filename}")
    
    print("✅ Data restoration completed!")

def verify_migration():
    """Verify the migration was successful"""
    print("🔍 Verifying migration...")
    
    from prompts.models import User, Category, Tag, Prompt, ContactMessage
    
    models_to_check = [
        ('Users', User),
        ('Categories', Category), 
        ('Tags', Tag),
        ('Prompts', Prompt),
        ('Contact Messages', ContactMessage),
    ]
    
    for name, model in models_to_check:
        try:
            count = model.objects.count()
            print(f"  → {name}: {count} records")
        except Exception as e:
            print(f"  ❌ Error checking {name}: {e}")
    
    print("✅ Migration verification completed!")

def main():
    """Main migration process"""
    print("🚀 Starting SQLite to MySQL migration...")
    print("=" * 50)
    
    # Check if we have both database connections
    try:
        mysql_conn = connections['default']
        mysql_conn.ensure_connection()
        print("✅ MySQL connection successful!")
    except Exception as e:
        print(f"❌ MySQL connection failed: {e}")
        print("Please check your MySQL settings in .env file")
        return
    
    # Step 1: Backup SQLite data (if exists)
    sqlite_db_path = "db.sqlite3"
    if os.path.exists(sqlite_db_path):
        print(f"📁 Found SQLite database: {sqlite_db_path}")
        backup_sqlite_data()
    else:
        print("ℹ️  No SQLite database found, skipping backup")
    
    # Step 2: Setup MySQL database
    if not setup_mysql_database():
        return
    
    # Step 3: Restore data to MySQL (if backup exists)
    if os.path.exists("backup"):
        restore_data_to_mysql()
    else:
        print("ℹ️  No backup data found, starting with empty database")
    
    # Step 4: Verify migration
    verify_migration()
    
    print("=" * 50)
    print("🎉 Migration completed successfully!")
    print("\nNext steps:")
    print("1. Test your application: python manage.py runserver")
    print("2. Create a superuser: python manage.py createsuperuser")
    print("3. Backup your MySQL database regularly")

if __name__ == "__main__":
    main()
