# 🚀 BookAstors 2.0 - App Flow Documentation

## 📱 Authentication Flow

### 1. 🎯 Splash Screen
- **Duration**: 3 seconds
- **Content**:
  - Bookastors logo (120x120 size)
  - App name "Bookastors"
  - Tagline "Your Beauty, Our Priority"
  - Loading animation (3 dots)
  - Dark theme background (#1a1a1a)
- **Navigation**: Auto-navigate to Mobile Login after 3 seconds

### 2. 📱 Mobile Login Screen
- **Purpose**: New user phone number verification
- **UI Elements**:
  - Country code: +91 (India)
  - Mobile number input field (10 digits)
  - "Send OTP" button
  - Loading state
  - Error handling for invalid numbers
- **Firebase**: Phone number verification setup
- **Navigation**: After sending OTP → OTP Verification Screen

### 3. 🔐 OTP Verification Screen
- **Purpose**: Verify mobile number with 6-digit code
- **UI Elements**:
  - 6 separate input boxes for OTP digits
  - "Verify OTP" button
  - Resend OTP option (30 seconds timer)
  - Error messages for wrong OTP
  - Loading state during verification
- **Firebase**: OTP verification logic
- **Navigation**: After successful verification → Enter Name Screen

### 4. ✏️ Enter Name Screen
- **Purpose**: Collect user's first and last name
- **UI Elements**:
  - First Name input field
  - Last Name input field
  - Profile picture preview (auto-generated)
  - "Continue" button
- **Profile Picture Generation**:
  - Auto Avatar: First letter of First Name
  - **Color Themes**:
    - A-E: Blue shades (#3B82F6, #1D4ED8)
    - F-J: Green shades (#10B981, #059669)
    - K-O: Purple shades (#8B5CF6, #7C3AED)
    - P-T: Orange shades (#F59E0B, #D97706)
    - U-Z: Red shades (#EF4444, #DC2626)
- **Navigation**: After entering name → Main Dashboard (HOME Tab)

## 🏠 Main Dashboard - 4 Bottom Tab Navigation

### 1. 🏠 HOME Tab
- **Top Section**:
  - Greetings with user's first name
  - Search bar for salons/services
  - Offers section
- **Category Tabs** (Horizontal scrollable):
  - Hair, Beard, Spa, Facial, Massage, etc.
- **Salon List Features**:
  - Distance-based ordering
  - Location-based results
  - Real-time updates
  - Pagination
  - Category filtering

#### Salon Card Structure
```
┌─────────────────────────────────────┐
│ [Salon Photo/Logo]                 │
├─────────────────────────────────────┤
│ 🏪 Salon Name                      │
│ 🏙️ City Name                      │
│ ⭐ Rating (reviews)                │
│ 📍 Distance                        │
│ ℹ️ Info Button                    │
├─────────────────────────────────────┤
│ 💇‍♀️ Services                      │
│ 💰 Price Range                     │
│ 🟢 Status                          │
│ [Book Now Button]                  │
└─────────────────────────────────────┘
```

### 2. ❤️ FAVOURITES Tab
- **Header Section**:
  - "My Favourites" title
  - Search and filter options
- **Content**:
  - Saved salons list
  - Same salon card structure as HOME tab
  - Quick actions (Book Now, Call, Share, Remove)
- **Empty State**: "No favourites yet" message

### 3. 📋 BOOKINGS Tab
- **Status Tabs**:
  - Pending
  - Confirmed
  - Cancelled
- **Booking Cards** (Status-specific layouts)
- **Action Buttons**:
  - Pending: Call, Download Ticket
  - Confirmed: Call, Download Receipt, Book New
  - Cancelled: Rebook, Call

### 4. 👤 PROFILE Tab
- **User Card**:
  - Profile picture (first letter avatar)
  - Name & mobile number
  - Edit profile button
- **Quick Stats**:
  - Total bookings
  - Favorite salons count
  - Member since date
- **Settings**:
  - Notifications toggle
  - Language preference
  - Theme selection
- **Additional Features**:
  - Invite Friends
  - Referral system
  - Logout

## 🔥 Firebase Backend Structure

### Database Collections

#### users
```json
{
  "userId": {
    "firstName": "String",
    "lastName": "String",
    "mobile": "String",
    "profilePic": "String",
    "profileColor": "String",
    "createdAt": "Timestamp",
    "updatedAt": "Timestamp"
  }
}
```

#### salons
```json
{
  "salonId": {
    "name": "String",
    "description": "String",
    "rating": "Number",
    "services": ["Array"],
    "priceRange": "String",
    "location": "String",
    "images": ["Array"],
    "status": "String"
  }
}
```

#### bookings
```json
{
  "bookingId": {
    "userId": "String",
    "salonId": "String",
    "services": ["Array"],
    "date": "Timestamp",
    "time": "String",
    "totalAmount": "Number",
    "status": "String",
    "createdAt": "Timestamp"
  }
}
```

#### favorites
```json
{
  "favoriteId": {
    "userId": "String",
    "salonId": "String",
    "addedAt": "Timestamp"
  }
}
```

## 🎨 UI/UX Design System

### Colors
- **Primary**: #1a1a1a (Dark theme)
- **Secondary**: #ffffff (White text)
- **Accent**: #3B82F6 (Blue)
- **Status Colors**:
  - Pending: #F59E0B
  - Confirmed: #10B981
  - Completed: #3B82F6
  - Cancelled: #EF4444

### Typography
- **Font Family**: Outfit
- **Weights**: Bold, Regular, Medium
- **Sizes**: Large (titles), Medium (inputs), Small (labels)

## 📝 Service Time Calculation

### Individual Service Times
- Hair Cut: 25 minutes
- Beard Trim: 15 minutes
- Facial: 45 minutes
- Spa: 60 minutes
- Nail Art: 30 minutes
- Hair Color: 90 minutes
- Hair Styling: 35 minutes
- Manicure: 25 minutes
- Pedicure: 30 minutes

### Setup/Transition Times
- Tool Setup: 5 minutes
- Equipment Change: 3-5 minutes
- Station Cleanup: 2-3 minutes
- Customer Preparation: 2-3 minutes
- Product Setup: 3-4 minutes
- Station Switch: 2-3 minutes

## 📱 Project Structure
```
src/
├── screens/
│   ├── Auth/
│   │   ├── Splash.js
│   │   ├── MobileLogin.js
│   │   ├── OTPVerification.js
│   │   └── EnterName.js
│   └── Dashboard/
│       ├── Home.js
│       ├── Favourites.js
│       ├── Bookings.js
│       └── Profile.js
└── navigations/
    ├── MainTabNavigator.js
    ├── AuthStack.js
    └── AppNavigator.js
```

## 📋 Development Phases

### Phase 1: Core Authentication
1. Splash Screen
2. Mobile Login Screen
3. OTP Verification Screen
4. Enter Name Screen

### Phase 2: Main Dashboard
1. Bottom Tab Navigation
2. Home Tab
3. Favourites Tab
4. Bookings Tab
5. Profile Tab

### Phase 3: Integration & Polish
1. Firebase integration
2. Navigation flow
3. State management
4. Error handling
5. UI animations
6. Loading states
7. Testing
