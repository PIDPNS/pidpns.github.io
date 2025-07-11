# PIDPNS Digital Event Backdrop

A secure, real-time digital backdrop system for Perpustakaan Negeri Sabah events with authentication and message management.

## 🔐 Authentication System

This project now includes a comprehensive authentication system to protect the digital backdrop from unauthorized access.

### Security Features

- **Email/Password Authentication** - Standard login with Supabase Auth
- **OAuth Integration** - Google and Microsoft sign-in options
- **Session Management** - Automatic session refresh and validation
- **Protected Routes** - All pages require authentication
- **Secure Redirects** - Automatic redirection for unauthenticated users

### Pages Structure

- **`login.html`** - Authentication page with multiple login options
- **`index.html`** - Main digital backdrop (protected)
- **`sql-editor.html`** - Database management interface (protected)
- **`auth.js`** - Authentication utility library

## 🚀 Getting Started

### 1. Authentication Setup

Users need to be authenticated before accessing the digital backdrop:

1. Visit `https://pidpns.github.io/login.html`
2. Sign in with:
   - Email and password (if account exists)
   - Google account
   - Microsoft account
3. After successful login, you'll be redirected to the main backdrop

### 2. User Management

Currently, the system supports:
- **OAuth users** (Google/Microsoft) - Automatic access
- **Email users** - Need to be invited/registered in Supabase

To add new users:
1. Access the Supabase dashboard
2. Go to Authentication > Users
3. Invite new users or create accounts manually

### 3. Access Levels

All authenticated users currently have:
- ✅ Access to main digital backdrop
- ✅ Real-time messaging system
- ✅ Photo upload capabilities
- ✅ SQL editor access (for admin purposes)

## 🛠️ Technical Implementation

### Authentication Flow

```
1. User visits any protected page
2. Page checks authentication status
3. If not authenticated → Redirect to login.html
4. If authenticated → Load page content
5. Session automatically refreshed as needed
```

### Database Schema

Your Supabase `messages` table supports:

```sql
- id (uuid) - Primary key
- author (text) - Message author name
- content (text) - Message content
- created_at (timestamp) - Creation time
- image_url (text) - Photo URL (optional)
- topic (text) - Message category
- extension (text) - Message type
- payload (jsonb) - Additional metadata
- event (text) - Event identifier
- private (boolean) - Visibility control
- updated_at (timestamp) - Last update
- inserted_at (timestamp) - Insert time
```

### Environment Configuration

The system uses these Supabase settings:
- **URL**: `https://amxvmnzhwehxmnwzzaoy.supabase.co`
- **Anon Key**: Embedded in code (safe for client-side)
- **Authentication**: Enabled for Google, Microsoft, Email
- **Storage**: Configured for message photos

## 📱 Features

### Digital Backdrop Screens

1. **Main Event Screen** - Event information slideshow
2. **Digital Photobooth** - Real-time message display
3. **Send Message Screen** - Message and photo submission
4. **Official Backdrop** - Ceremonial page for VIPs

### Real-time Capabilities

- ✅ Live message updates
- ✅ Photo uploads and display
- ✅ Multi-screen navigation
- ✅ Theme switching (dark/light)
- ✅ Responsive design

### Admin Features

- 🗄️ **SQL Editor** - Direct database access
- 👤 **User Menu** - Profile and logout options
- 📊 **Query Templates** - Pre-built database queries
- 🔍 **Real-time Monitoring** - Live connection status

## Official Digital Backdrop Editing System

The Official Digital Backdrop now supports inline editing functionality that allows authenticated users to modify event content directly and save changes to the Supabase database.

### Features

#### 1. **Inline Text Editing**
- **Double-click any editable field** to start editing
- **Single-click in edit mode** for quick editing
- **Press Enter** to save changes
- **Press Escape** to cancel editing
- **Click outside** to auto-save changes

#### 2. **Editable Fields**
- **Event Title**: Main ceremony title (e.g., "MAJLIS PERASMIAN")
- **Event Name**: Primary event name (e.g., "MINGGU PERPUSTAKAAN DAN STORYWALK®")
- **Event Subtitle**: Secondary event description (e.g., "(Walk With The Library)")
- **Officiated By Text**: Opening text (e.g., "Dirasmikan oleh,")
- **VIP Name**: Name of the officiating dignitary
- **VIP Position**: Title/position of the VIP
- **Event Date**: Date information (e.g., "24 Jun 2023 (Sabtu)")
- **Event Time**: Time information (e.g., "08:00 Pagi")
- **Event Location**: Venue details (supports HTML formatting)
- **Slogan**: Event slogan (e.g., '"SABAH MAJU JAYA"')

#### 3. **Logo Management**
- **Click the logo in edit mode** to upload a new logo
- **Supported formats**: JPG, PNG, GIF, WebP
- **File size limit**: 5MB maximum
- **Auto-backup**: Previous logos are stored in Supabase Storage

#### 4. **Database Integration**
- **Real-time saving**: Changes are automatically saved to Supabase
- **Version history**: Previous content versions are maintained
- **User tracking**: All changes are logged with user information
- **Rollback capability**: Ability to restore previous versions

### How to Use

#### 1. **Enable Edit Mode**
1. Navigate to the Official Digital Backdrop screen
2. Click the "Edit Mode" button (appears only on the official screen)
3. The page will highlight editable areas with green outlines

#### 2. **Edit Content**
1. **For Text Fields**:
   - Double-click any text to start editing
   - Type your new content
   - Press Enter to save or click outside the field

2. **For Logo**:
   - Click the logo area in edit mode
   - Select a new image file from your device
   - The logo will automatically upload and update

#### 3. **Save and Exit**
1. All changes are automatically saved as you edit
2. Watch for the green "Saved successfully" indicator
3. Click "Exit Edit" to leave edit mode

### Database Setup

The system requires a `official_backdrop_content` table in Supabase with the following structure:

```sql
CREATE TABLE official_backdrop_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'MAJLIS PERASMIAN',
  event_name TEXT NOT NULL DEFAULT 'MINGGU PERPUSTAKAAN DAN STORYWALK®',
  event_subtitle VARCHAR(255) DEFAULT '(Walk With The Library)',
  officiated_by_text VARCHAR(255) DEFAULT 'Dirasmikan oleh,',
  vip_name TEXT NOT NULL DEFAULT 'YB. Datuk Dr. Haji Mohd Arifin Bin Datuk Haji Mohd. Arif, JP',
  vip_position VARCHAR(255) DEFAULT 'Menteri Sains, Teknologi dan Inovasi Sabah',
  event_date VARCHAR(100) DEFAULT '24 Jun 2023 (Sabtu)',
  event_time VARCHAR(50) DEFAULT '08:00 Pagi',
  event_location TEXT DEFAULT 'Taman Ujana Rimba Tropika & Dewan Mataking, Ibu Pejabat Perpustakaan Negeri Sabah',
  slogan VARCHAR(255) DEFAULT '"SABAH MAJU JAYA"',
  logo_url VARCHAR(500) DEFAULT 'assets/2.png',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(255)
);
```

### Storage Setup

For logo uploads, a Supabase Storage bucket named `logos` must be created with public read access:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Set up policies for authenticated access
```

### Security Features

- **Authentication Required**: Only authenticated users can edit content
- **Role-based Access**: Proper RLS policies ensure data security
- **Change Tracking**: All modifications are logged with user information
- **Input Validation**: File type and size validation for uploads
- **XSS Protection**: Proper text sanitization for user inputs

### Visual Indicators

- **Edit Mode**: Green dashed border around the content area
- **Hover Effects**: Green highlight on editable fields
- **Edit Icons**: Small edit icons appear on hover
- **Save Status**: Real-time saving indicators with success/error messages
- **Active Editing**: Blue outline around currently editing field

### Responsive Design

The editing interface is fully responsive and works on:
- **Desktop**: Full functionality with keyboard shortcuts
- **Tablet**: Touch-optimized editing experience
- **Mobile**: Simplified interface with essential features

### Troubleshooting

1. **Edit Mode Button Not Visible**: Ensure you're on the Official Digital Backdrop screen
2. **Changes Not Saving**: Check network connection and authentication status
3. **Logo Upload Fails**: Verify file size (<5MB) and format (image files only)
4. **Database Errors**: Ensure proper Supabase setup and RLS policies
5. **Permission Errors**: Verify user authentication and database permissions

### Future Enhancements

- **Template Management**: Multiple event templates
- **Bulk Import**: CSV/Excel import for event data
- **Advanced Formatting**: Rich text editor for descriptions
- **Multi-language Support**: Bilingual content management
- **Approval Workflow**: Content review before publication

---

**Perpustakaan Negeri Sabah** - Pasukan Inovasi Digital

## Quick Setup Guide for Official Backdrop Editing

### 🎯 **What Changed:**

1. **✅ Removed Edit Button**: No more visible edit mode button for professional live streaming
2. **✅ Hover-Based Editing**: Simply hover over any text to see subtle edit indicators
3. **✅ Professional UI**: Very subtle visual effects that won't distract during live streams
4. **✅ Complete Database Setup**: Comprehensive SQL script for your Supabase database

### 🚀 **Setup Instructions:**

#### **Step 1: Database Setup**
1. **Open your Supabase Dashboard** → Go to SQL Editor
2. **Copy the entire contents** of `database-setup.sql`
3. **Paste and run** the SQL script in your Supabase SQL Editor
4. **Wait for completion** - you'll see success messages

#### **Step 2: Test the System**
1. **Navigate** to your Official Digital Backdrop screen
2. **Hover over any text** - you'll see subtle green highlights
3. **Double-click any text** to start editing
4. **Type your changes** and press Enter to save

### 📊 **Database Structure Overview:**

After running the SQL script, you'll have these tables:

| Table Name | Purpose | Records |
|------------|---------|---------|
| `messages` | Award messages & photos | Your existing data |
| `official_backdrop_content` | Official ceremony content | 1 active record |
| `main_event_slides` | Main screen rotating slides | 3 default slides |
| `user_profiles` | Extended user information | Based on your auth users |
| `system_settings` | Global app settings | 7 default settings |
| `audit_log` | Change tracking | All user actions |

### 🎨 **How to Edit Content:**

#### **Text Editing:**
- **Hover** over any text → See green highlight
- **Double-click** → Text becomes editable
- **Type changes** → Press Enter to save
- **See "Saved" indicator** → Changes stored in database

#### **Logo Editing:**
- **Hover** over logo → See upload overlay
- **Click** → Select new image file
- **Auto-upload** → New logo saved and displayed

### 🔧 **Database Queries to Try:**

Run these in your Supabase SQL Editor to explore your data:

```sql
-- View current official backdrop content
SELECT * FROM get_active_official_content();

-- View all messages
SELECT author, content, created_at FROM messages ORDER BY created_at DESC LIMIT 10;

-- View system statistics
SELECT * FROM system_stats_view;

-- View recent activities
SELECT user_email, action, table_name, created_at 
FROM audit_log 
ORDER BY created_at DESC 
LIMIT 20;
```

### 🎥 **Live Streaming Ready:**

The editing interface is now **completely invisible** during live streaming:
- ✅ No edit buttons or mode toggles
- ✅ Minimal save indicators (small, discrete)
- ✅ Hover effects only appear when needed
- ✅ Professional appearance maintained

Your digital backdrop is now ready for both live streaming and easy content management!
