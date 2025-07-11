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

## 🔧 Development

### Local Development

1. Clone the repository
2. Serve the files using a local server (required for authentication)
3. All authentication will work with the live Supabase instance

### Deployment

The project is configured for GitHub Pages:
- Automatic deployment on push to main branch
- All authentication flows work with the live URL
- No additional configuration needed

### Security Notes

- ✅ Client-side code is safe (uses anon key)
- ✅ All sensitive operations protected by RLS
- ✅ OAuth redirect URLs configured correctly
- ✅ Session management handles token refresh

## 📞 Support

For access issues or technical support:
- **Email**: admin@pidpns.gov.my
- **Technical Issues**: Contact repository maintainer

## 🎯 Future Enhancements

Potential improvements with the current database schema:

- **Role-based access** using user metadata
- **Event-specific backdrops** using the `event` field
- **Message categories** using the `topic` field
- **Private messaging** using the `private` field
- **Message editing** with `updated_at` tracking
- **Rich metadata** in the `payload` JSONB field

---

**Perpustakaan Negeri Sabah** - Pasukan Inovasi Digital
