import { createSlice } from '@reduxjs/toolkit';

const auctionSlice = createSlice({
    name: 'auction',
    initialState: {
        currentPrice: 1000, // Real-time price
        objectName: 'Bat', // Name of the auctioned object
        currentBidder:'None'
    },
    reducers: {
        setPrice: (state, action) => {
            state.currentPrice = action.payload;
        },
        setObjectName: (state, action) => {
            state.objectName = action.payload;
        },
        setCurrentBidder: (state, action) => {
            state.currentBidder = action.payload;
        },
    },
});

export const { setPrice, setObjectName, setCurrentBidder } = auctionSlice.actions;

export default auctionSlice.reducer;
