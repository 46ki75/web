import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface HeadingsState {
  headings: Array<{
    text: string
    level: 1 | 2 | 3 | 4 | 5 | 6
    identifier?: string
  }>
}

const initialState: HeadingsState = {
  headings: []
}

const loadingSlice = createSlice({
  name: 'headings',
  initialState,
  reducers: {
    setHeadings: (
      state,
      action: PayloadAction<
        Array<{
          text: string
          level: 1 | 2 | 3 | 4 | 5 | 6
          identifier?: string
        }>
      >
    ) => {
      state.headings = action.payload
    }
  }
})

export const { setHeadings } = loadingSlice.actions

export default loadingSlice.reducer
