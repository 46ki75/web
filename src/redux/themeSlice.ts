import { createSlice } from '@reduxjs/toolkit'

interface ThemeState {
  isDark: boolean
}

const initialState: ThemeState = {
  isDark:
    typeof window !== 'undefined'
      ? localStorage.getItem('theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light')
    },
    setDarkTheme: (state) => {
      state.isDark = true
      localStorage.setItem('theme', 'dark')
    },
    setLightTheme: (state) => {
      state.isDark = false
      localStorage.setItem('theme', 'light')
    }
  }
})

export const { toggleTheme, setDarkTheme, setLightTheme } = themeSlice.actions

export default themeSlice.reducer
