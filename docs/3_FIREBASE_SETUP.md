# BookAstors Firebase Setup & Integration Guide

## Firebase Services Setup

### 1. Authentication
```typescript
// src/services/firebase/auth.ts
import auth from '@react-native-firebase/auth';

export const firebaseAuth = {
  // Phone Authentication
  async signInWithPhone(phoneNumber: string): Promise<string> {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation.verificationId;
  },

  // OTP Verification
  async verifyOTP(verificationId: string, code: string): Promise<UserCredential> {
    const credential = auth.PhoneAuthProvider.credential(verificationId, code);
    return auth().signInWithCredential(credential);
  },

  // Sign Out
  async signOut(): Promise<void> {
    await auth().signOut();
  }
};
```

### 2. Firestore Database
```typescript
// src/services/firebase/firestore.ts
import firestore from '@react-native-firebase/firestore';

export const db = {
  // Collections
  users: firestore().collection('users'),
  salons: firestore().collection('salons'),
  bookings: firestore().collection('bookings'),
  favorites: firestore().collection('favorites'),

  // Timestamps
  timestamp: firestore.FieldValue.serverTimestamp(),
  
  // Batch Operations
  batch: firestore().batch()
};
```

## Database Schema

### 1. Users Collection
```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePic: string;
  profileColor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fcmTokens: string[];
  preferences: {
    notifications: boolean;
    language: string;
    theme: 'light' | 'dark';
  };
}
```

### 2. Salons Collection
```typescript
interface Salon {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  services: Service[];
  rating: number;
  reviews: number;
  images: string[];
  workingHours: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  status: 'active' | 'inactive';
  features: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}
```

### 3. Bookings Collection
```typescript
interface Booking {
  id: string;
  userId: string;
  salonId: string;
  services: {
    serviceId: string;
    name: string;
    duration: number;
    price: number;
  }[];
  date: Timestamp;
  timeSlot: {
    start: string;
    end: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  totalDuration: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. Favorites Collection
```typescript
interface Favorite {
  id: string;
  userId: string;
  salonId: string;
  createdAt: Timestamp;
}
```

## Firebase Queries

### 1. User Queries
```typescript
// User CRUD Operations
export const userQueries = {
  // Create/Update User
  async upsertUser(userId: string, userData: Partial<User>): Promise<void> {
    await db.users.doc(userId).set({
      ...userData,
      updatedAt: db.timestamp
    }, { merge: true });
  },

  // Get User
  async getUser(userId: string): Promise<User | null> {
    const doc = await db.users.doc(userId).get();
    return doc.exists ? doc.data() as User : null;
  },

  // Update FCM Token
  async updateFCMToken(userId: string, token: string): Promise<void> {
    await db.users.doc(userId).update({
      fcmTokens: firestore.FieldValue.arrayUnion(token)
    });
  }
};
```

### 2. Salon Queries
```typescript
// Salon Queries
export const salonQueries = {
  // Get Nearby Salons
  async getNearbySalons(location: GeoPoint, radius: number): Promise<Salon[]> {
    const snapshot = await db.salons
      .where('status', '==', 'active')
      .orderBy('location.coordinates')
      .startAt([location.latitude - radius, location.longitude - radius])
      .endAt([location.latitude + radius, location.longitude + radius])
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Salon));
  },

  // Get Salon by Category
  async getSalonsByCategory(category: string): Promise<Salon[]> {
    const snapshot = await db.salons
      .where('services.category', 'array-contains', category)
      .where('status', '==', 'active')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Salon));
  }
};
```

### 3. Booking Queries
```typescript
// Booking Operations
export const bookingQueries = {
  // Create Booking
  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<string> {
    const ref = await db.bookings.add({
      ...bookingData,
      createdAt: db.timestamp,
      updatedAt: db.timestamp
    });
    return ref.id;
  },

  // Get User Bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    const snapshot = await db.bookings
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
  },

  // Update Booking Status
  async updateBookingStatus(
    bookingId: string, 
    status: Booking['status']
  ): Promise<void> {
    await db.bookings.doc(bookingId).update({
      status,
      updatedAt: db.timestamp
    });
  }
};
```

### 4. Favorites Queries
```typescript
// Favorites Operations
export const favoriteQueries = {
  // Toggle Favorite
  async toggleFavorite(userId: string, salonId: string): Promise<void> {
    const ref = db.favorites
      .where('userId', '==', userId)
      .where('salonId', '==', salonId)
      .limit(1);

    const snapshot = await ref.get();

    if (snapshot.empty) {
      await db.favorites.add({
        userId,
        salonId,
        createdAt: db.timestamp
      });
    } else {
      await snapshot.docs[0].ref.delete();
    }
  },

  // Get User Favorites
  async getUserFavorites(userId: string): Promise<string[]> {
    const snapshot = await db.favorites
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map(doc => doc.data().salonId);
  }
};
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User Authentication Check
    function isAuthenticated() {
      return request.auth != null;
    }

    // User Document Owner Check
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Salons Collection
    match /salons/{salonId} {
      allow read: if true;
      allow write: if false; // Admin only
    }

    // Bookings Collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid);
    }

    // Favorites Collection
    match /favorites/{favoriteId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        (request.resource.data.userId == request.auth.uid);
    }
  }
}
```

## Performance Optimization

### 1. Query Optimization
- Use compound queries
- Implement pagination
- Cache frequently accessed data
- Use real-time updates selectively

### 2. Batch Operations
```typescript
// Batch Write Example
async function batchUpdate(operations: BatchOperation[]) {
  const batch = db.batch();
  
  operations.forEach(op => {
    const ref = db[op.collection].doc(op.id);
    batch[op.type](ref, op.data);
  });

  await batch.commit();
}
```

## Error Handling

```typescript
// Firebase Error Handler
export const handleFirebaseError = (error: FirebaseError) => {
  switch (error.code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP code';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
};
```
