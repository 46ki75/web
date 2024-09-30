import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'

export const makeStore = () =>
  configureStore({
    reducer: {
      theme: themeReducer
    }
  })

export type RootState = ReturnType<typeof makeStore>['getState']
export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = ReturnType<typeof makeStore>['dispatch']
