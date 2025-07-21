import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    incomingCall: null, // will store { offer, from, caller }
};

const callSlice = createSlice({
    name: 'call',
    initialState,
    reducers: {
        setIncomingCall: (state, action) => {
            state.incomingCall = action.payload;
        },
        clearIncomingCall: (state) => {
            state.incomingCall = null;
        },
    },
});

export const { setIncomingCall, clearIncomingCall } = callSlice.actions;
export default callSlice.reducer;
