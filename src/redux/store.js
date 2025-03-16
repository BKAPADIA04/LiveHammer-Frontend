import { configureStore } from '@reduxjs/toolkit';
import auctionReducer from './auctionSlice';

export const store = configureStore({
    reducer: {
        auction: auctionReducer,
    },
});
