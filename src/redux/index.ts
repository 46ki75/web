import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'

const rootReducer = {
  theme: themeReducer
}

export const makeStore = () =>
  configureStore({
    reducer: rootReducer
  })

export type RootState = {
  theme: ReturnType<typeof themeReducer>
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
