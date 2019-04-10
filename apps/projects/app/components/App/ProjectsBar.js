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

// TODO: Move to constants file
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'issues', label: 'Issues' },
  { id: 'settings', label: 'Settings' },
]

const ProjectsBar = ({ children, onParamsRequest, onRequestMenu, params }) => {
  const getIssues = () => {
    const issues = [{ number: 0 }, { number: 1 }, { number: 2 }, { number: 3 }]
    return issues
  }
  const getIssueFromIssueNumber = issueNumber =>
    getIssues().find(issue => issue.number === issueNumber)

  const getLocation = () => {
    if (!params) {
      return { activeTab: 0, openedIssueNumber: null }
    }

    // TODO: make look like: https://mainnet.aragon.org/#/autark.aragonid.eth/range-voting?t=ANT&id=1
    const parts = params.split('_')
    const activeTab = TABS.findIndex(({ id }) => id === parts[0])
    const openedIssue = getIssueFromIssueNumber(parts[1])

    return {
      activeTab: activeTab === -1 ? 0 : activeTab,
      openedIssueNumber: openedIssue ? openedIssue.number : null,
    }
  }

  const updateLocation = ({ activeTab, openedIssueNumber }) => {
    const location = getLocation()
    if (activeTab !== undefined) {
      location.activeTab = activeTab
    }
    if (openedIssueNumber !== undefined) {
      location.openedIssueNumber = openedIssueNumber
    }

    onParamsRequest(
      `${TABS[location.activeTab].id}${
        location.openedIssueNumber ? `_${location.openedIssueNumber}` : ''
      }`
    )
  }

  const handleScreenChange = tabIndex => {
    updateLocation({ activeTab: tabIndex })
  }

  const handleMenuPanelOpen = () => {
    this.props.onMessage({
      data: { from: 'app', name: 'menuPanel', value: true },
    })
  }

  const { activeTab, openedIssueNumber } = getLocation()

  return (
    <AppBar
      tabs={
        openedIssueNumber ? null : (
          <TabBar
            items={TABS.map(screen => screen.label)}
            selected={activeTab}
            onChange={handleScreenChange}
          />
        )
      }
    >
      <Viewport>
        {({ below }) =>
          below('medium') && <MenuButton onClick={onRequestMenu} />
        }
      </Viewport>
      {children}
    </AppBar>
  )
}
export default ProjectsBar
