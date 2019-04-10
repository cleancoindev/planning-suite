// import '@babel/polyfill'

import './utils/devTooling'
import React from 'react'
import ReactDOM from '@hot-loader/react-dom'
import { AragonApi } from '@aragon/api-react'

// import appStateReducer from './app-state-reducer'
// import { projectsMockData } from './utils/mockData'
import App from './components/App/App'

ReactDOM.unstable_createRoot(document.querySelector('#projects')).render(
  <AragonApi /*reducer={appStateReducer}*/>
    <App />
  </AragonApi>
)
