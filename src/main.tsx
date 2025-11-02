import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'

const brandPrimary = '#10797D'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        primaryColor: 'teal',
        colors: {
          // provide a teal-like palette where index 6 is the brand color
          teal: ['#e6fbf6', '#c9f7ef', '#9ff1e1', '#6fe8d0', '#40d7bf', '#10a89f', brandPrimary, '#0b6d60', '#08413f', '#04211f'],
        },
      } as any}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
