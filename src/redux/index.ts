import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'
import loadingReducer from './loadingSlice'
import headingReducer from './headingsSlice'

const rootReducer = {
  theme: themeReducer,
  loading: loadingReducer,
  headings: headingReducer
}

export const makeStore = () =>
  configureStore({
    reducer: rootReducer
  })

export type RootState = {
  theme: ReturnType<typeof themeReducer>
  loading: ReturnType<typeof loadingReducer>
  headings: ReturnType<typeof headingReducer>
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
