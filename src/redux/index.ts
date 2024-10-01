import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'
import loadingReducer from './loadingSlice'

const rootReducer = {
  theme: themeReducer,
  loading: loadingReducer
}

export const makeStore = () =>
  configureStore({
    reducer: rootReducer
  })

export type RootState = {
  theme: ReturnType<typeof themeReducer>
  loading: ReturnType<typeof loadingReducer>
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
