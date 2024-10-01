import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface LoadingState {
  isRouteChanging: boolean
}

const initialState: LoadingState = {
  isRouteChanging: false
}

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setIsRouteChanging: (state, action: PayloadAction<boolean>) => {
      state.isRouteChanging = action.payload
    }
  }
})

export const { setIsRouteChanging } = loadingSlice.actions

export default loadingSlice.reducer
