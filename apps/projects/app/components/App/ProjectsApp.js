import { hot } from 'react-hot-loader'
import { map } from 'rxjs/operators'
import PropTypes from 'prop-types'
import React, { useState } from 'react'

import { ApolloProvider } from 'react-apollo'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import { useAragonApi } from '@aragon/api-react'
import {
  AppBar,
  AppView,
  Main,
  NavigationBar,
  observe,
  TabBar,
  Viewport,
} from '@aragon/ui'

import AppLayout from './AppLayout'
import { AppContent } from '.'
import { Title } from '../Shared'
import PanelManager, { PANELS } from '../Panel'
import { STATUS } from '../../utils/github'
import ErrorBoundary from './ErrorBoundary'
import { ipfsAdd, computeIpfsString } from '../../utils/ipfs-helpers'
import { networkContextType } from '../../../../../shared/ui'
import {
  REQUESTING_GITHUB_TOKEN,
  REQUESTED_GITHUB_TOKEN_SUCCESS,
  REQUESTED_GITHUB_TOKEN_FAILURE,
} from '../../store/eventTypes'
import { CURRENT_USER } from '../../utils/gql-queries'

const ProjectsApp = () => {
  // TODO: make this a context hook or reducer
  const [ params, onParamsRequest ] = useState()
  // const { requestMenu, displayMenuButton } = useAragonApi()

  // const navigationItems = [ 'Projects', ...(currentIssue ? 'Issue Detail' : []) ]
  const navigationItems = ['Projects']

  const handleCloseIssueDetail = () => {
    onParamsRequest(null)
    navigationItems.pop()
  }

  // const handleRequestMenu = () => {
  //   requestMenu()
  // }

  return (
    <Main>
      <AppView
        appBar={
          <ProjectsBar
            onParamsRequest={onParamsRequest}
            // onRequestMenu={handleRequestMenu}
            params={params}
          >
            <NavigationBar
              items={navigationItems}
              onBack={handleCloseIssueDetail}
            />
          </ProjectsBar>
        }
      >
        <ProjectsContent />
      </AppView>
    </Main>
  )
}

ProjectsApp.propTypes = {
  app: PropTypes.object.isRequired,
  repos: PropTypes.arrayOf(PropTypes.object),
}

export default observe(
  observable => observable.pipe(map(state => ({ ...state }))),
  {}
)(hot(module)(ProjectsApp))
