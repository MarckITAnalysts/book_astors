# BookAstors State Management Guide

## Hybrid State Management Approach

We use a hybrid approach combining Redux and Zustand:
- Redux for global application state
- Zustand for feature-specific state

### When to Use Each:

#### Redux
- User authentication state
- App-wide configurations
- Shared data between multiple features
- Complex state with many reducers
- When you need middleware (thunks, sagas)

#### Zustand
- Feature-specific state
- Simple state management
- UI state
- Form state
- Temporary data storage

## Redux Setup

### 1. Store Configuration
```typescript
// src/store/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authReducer, salonReducer, bookingReducer } from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    salons: salonReducer,
    bookings: bookingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      thunk: true
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Slices

#### Auth Slice
```typescript
// src/store/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
    }
  }
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
```

#### Salon Slice
```typescript
// src/store/redux/slices/salonSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SalonState {
  salons: Salon[];
  selectedSalon: Salon | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalonState = {
  salons: [],
  selectedSalon: null,
  loading: false,
  error: null
};

const salonSlice = createSlice({
  name: 'salons',
  initialState,
  reducers: {
    setSalons: (state, action: PayloadAction<Salon[]>) => {
      state.salons = action.payload;
      state.error = null;
    },
    setSelectedSalon: (state, action: PayloadAction<Salon>) => {
      state.selectedSalon = action.payload;
    },
    clearSelectedSalon: (state) => {
      state.selectedSalon = null;
    }
  }
});

export const { setSalons, setSelectedSalon, clearSelectedSalon } = salonSlice.actions;
export default salonSlice.reducer;
```

### 3. Thunks
```typescript
// src/store/redux/thunks/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { firebaseAuth } from '@/services/firebase';

export const signInWithPhone = createAsyncThunk(
  'auth/signInWithPhone',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const verificationId = await firebaseAuth.signInWithPhone(phoneNumber);
      return verificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ verificationId, code }: VerifyOTPParams, { rejectWithValue }) => {
    try {
      const userCredential = await firebaseAuth.verifyOTP(verificationId, code);
      return userCredential.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Zustand Setup

### 1. Store Creation
```typescript
// src/store/zustand/createStore.ts
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const createStore = <T extends object>(
  initialState: T,
  name: string
) => {
  return create<T>()(
    devtools(
      persist(
        (set) => ({
          ...initialState,
          reset: () => set(initialState)
        }),
        { name }
      )
    )
  );
};

export default createStore;
```

### 2. Feature Stores

#### Booking Store
```typescript
// src/store/zustand/bookingStore.ts
import createStore from './createStore';

interface BookingState {
  selectedServices: Service[];
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  setDate: (date: Date) => void;
  setTimeSlot: (time: string) => void;
  clearBooking: () => void;
}

const initialState = {
  selectedServices: [],
  selectedDate: null,
  selectedTimeSlot: null
};

export const useBookingStore = createStore<BookingState>({
  ...initialState,
  
  addService: (service) => 
    useBookingStore.setState((state) => ({
      selectedServices: [...state.selectedServices, service]
    })),
    
  removeService: (serviceId) =>
    useBookingStore.setState((state) => ({
      selectedServices: state.selectedServices.filter(s => s.id !== serviceId)
    })),
    
  setDate: (date) =>
    useBookingStore.setState({ selectedDate: date }),
    
  setTimeSlot: (time) =>
    useBookingStore.setState({ selectedTimeSlot: time }),
    
  clearBooking: () =>
    useBookingStore.setState(initialState)
}, 'booking');
```

#### UI Store
```typescript
// src/store/zustand/uiStore.ts
import createStore from './createStore';

interface UIState {
  isLoading: boolean;
  modal: {
    isVisible: boolean;
    type: string | null;
    data: any;
  };
  setLoading: (loading: boolean) => void;
  showModal: (type: string, data?: any) => void;
  hideModal: () => void;
}

const initialState = {
  isLoading: false,
  modal: {
    isVisible: false,
    type: null,
    data: null
  }
};

export const useUIStore = createStore<UIState>({
  ...initialState,
  
  setLoading: (loading) =>
    useUIStore.setState({ isLoading: loading }),
    
  showModal: (type, data) =>
    useUIStore.setState({
      modal: { isVisible: true, type, data }
    }),
    
  hideModal: () =>
    useUIStore.setState({
      modal: { isVisible: false, type: null, data: null }
    })
}, 'ui');
```

## Custom Hooks

### 1. Redux Hooks
```typescript
// src/hooks/useRedux.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/redux/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 2. Combined State Hooks
```typescript
// src/hooks/useAuth.ts
import { useAppSelector, useAppDispatch } from './useRedux';
import { signInWithPhone, verifyOTP } from '@/store/redux/thunks/authThunks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector(state => state.auth);

  const login = async (phoneNumber: string) => {
    return dispatch(signInWithPhone(phoneNumber)).unwrap();
  };

  const verify = async (params: VerifyOTPParams) => {
    return dispatch(verifyOTP(params)).unwrap();
  };

  return {
    user,
    loading,
    error,
    login,
    verify
  };
};
```

## State Management Best Practices

### 1. State Organization
```typescript
// Feature-based organization
src/store/
├── redux/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── salonSlice.ts
│   │   └── bookingSlice.ts
│   ├── thunks/
│   │   ├── authThunks.ts
│   │   └── salonThunks.ts
│   └── store.ts
└── zustand/
    ├── createStore.ts
    ├── bookingStore.ts
    └── uiStore.ts
```

### 2. Performance Optimization
```typescript
// Memoized Selectors
import { createSelector } from '@reduxjs/toolkit';

export const selectFilteredSalons = createSelector(
  [
    (state: RootState) => state.salons.salons,
    (state: RootState, category: string) => category
  ],
  (salons, category) => {
    return category
      ? salons.filter(salon => salon.categories.includes(category))
      : salons;
  }
);
```

### 3. Error Handling
```typescript
// Global Error Handler
export const withErrorHandler = 
  (action: AsyncThunk<any, any, any>) =>
  async (dispatch: AppDispatch) => {
    try {
      await dispatch(action).unwrap();
    } catch (error) {
      dispatch(setError(error.message));
      // Additional error handling
    }
  };
```

### 4. State Persistence
```typescript
// Redux Persist Configuration
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'] // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
```

## Testing State Management

### 1. Redux Tests
```typescript
// src/__tests__/store/redux/slices/authSlice.test.ts
import authReducer, { setUser, logout } from '@/store/redux/slices/authSlice';

describe('Auth Slice', () => {
  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      user: null,
      loading: false,
      error: null
    });
  });

  it('should handle setUser', () => {
    const user = { id: '1', name: 'Test User' };
    const actual = authReducer(undefined, setUser(user));
    expect(actual.user).toEqual(user);
  });
});
```

### 2. Zustand Tests
```typescript
// src/__tests__/store/zustand/bookingStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useBookingStore } from '@/store/zustand/bookingStore';

describe('Booking Store', () => {
  it('should add service', () => {
    const { result } = renderHook(() => useBookingStore());
    const service = { id: '1', name: 'Haircut' };
    
    act(() => {
      result.current.addService(service);
    });
    
    expect(result.current.selectedServices).toContain(service);
  });
});
```
