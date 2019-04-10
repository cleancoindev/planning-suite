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

const ProjectsContent = () => {
  // const { api, connectedAccount, network } = useAragonApi()

  // const initialState = {
  //   repos: [],
  //   panelProps: {},
  //   activeIndex: { tabIndex: 0, tabData: {} },
  //   githubLoading: false,
  //   githubCurrentUser: {},
  //   client: initApolloClient((props.github && props.github.token) || ''),
  // }

  // const checkForToken = () => {
  //   const hasGithubToken = this.props.github && this.props.github.token
  //   const hadGithubToken = prevProps.github && prevProps.github.token
  //   const receivedGithubToken = hasGithubToken && !hadGithubToken
  //   if (receivedGithubToken) {
  //     const client = initApolloClient(this.props.github.token)
  //     client
  //       .query({
  //         query: CURRENT_USER,
  //       })
  //       .then(({ data }) => {
  //         this.setState({
  //           client,
  //           githubCurrentUser: data.viewer,
  //         })
  //       })
  //   }
  // }

  // const handlePopupMessage = async message => {
  //   if (message.data.from !== 'popup') return
  //   if (message.data.name === 'code') {
  //     // TODO: Optimize the listeners lifecycle, ie: remove on unmount
  //     window.removeEventListener('message', this.messageHandler)

  //     const code = message.data.value
  //     try {
  //       const token = await getToken(code)
  //       this.setState(
  //         {
  //           githubLoading: false,
  //           panelProps: {
  //             onCreateProject: this.createProject,
  //             status: STATUS.AUTHENTICATED,
  //           },
  //         },
  //         () => {
  //           this.props.app.cache('github', {
  //             event: REQUESTED_GITHUB_TOKEN_SUCCESS,
  //             status: STATUS.AUTHENTICATED,
  //             token,
  //           })
  //         }
  //       )
  //     } catch (err) {
  //       this.setState(
  //         {
  //           githubLoading: false,
  //           panelProps: {
  //             onCreateProject: this.createProject,
  //             status: STATUS.FAILED,
  //           },
  //         },
  //         () => {
  //           this.props.app.cache('github', {
  //             event: REQUESTED_GITHUB_TOKEN_FAILURE,
  //             status: STATUS.FAILED,
  //             token: null,
  //           })
  //         }
  //       )
  //     }
  //   }
  // }

  // const handleMenuPanelOpen = () => {
  //   window.parent.postMessage(
  //     { from: 'app', name: 'menuPanel', value: true },
  //     '*'
  //   )
  // }

  // const changeActiveIndex = activeIndex => {
  //   this.setState({ activeIndex })
  // }

  // const createProject = ({ owner, project }) => {
  //   this.closePanel()
  //   this.props.app.addRepo(web3.toHex(project), web3.toHex(owner))
  // }

  // const removeProject = project => {
  //   this.props.app.removeRepo(web3.toHex(project))
  //   // TODO: Toast feedback here maybe
  // }

  // const newIssue = () => {
  //   const { repos } = this.props
  //   const repoNames =
  //     (repos &&
  //       repos.map(repo => ({
  //         name: repo.metadata.name,
  //         id: repo.data._repo,
  //       }))) ||
  //     'No repos'
  //   const reposIds = (repos && repos.map(repo => repo.data.repo)) || []

  //   this.setState(() => ({
  //     panel: PANELS.NewIssue,
  //     panelProps: {
  //       reposManaged: repoNames,
  //       closePanel: this.closePanel,
  //       reposIds,
  //     },
  //   }))
  // }

  // // TODO: Review
  // // This is breaking RepoList loading sometimes preventing show repos after login
  // const newProject = () => {
  //   const reposAlreadyAdded = this.props.repos
  //     ? this.props.repos.map(repo => repo.data._repo)
  //     : []

  //   this.setState((_prevState, { github: { status } }) => ({
  //     panel: PANELS.NewProject,
  //     panelProps: {
  //       onCreateProject: this.createProject,
  //       onGithubSignIn: this.handleGithubSignIn,
  //       reposAlreadyAdded,
  //       status: status,
  //     },
  //   }))
  // }

  // const newBountyAllocation = issues => {
  //   this.setState((_prevState, _prevProps) => ({
  //     panel: PANELS.FundIssues,
  //     panelProps: {
  //       issues: issues,
  //       onSubmit: this.onSubmitBountyAllocation,
  //       bountySettings: this.props.bountySettings,
  //       tokens: this.props.tokens ? this.props.tokens : [],
  //       closePanel: this.cancelBounties,
  //     },
  //   }))
  // }

  // const onSubmitBountyAllocation = async (issues, description) => {
  //   this.closePanel()

  //   // computes an array of issues and denests the actual issue object for smart contract
  //   const issuesArray = []
  //   const bountySymbol = this.props.bountySettings.bountyCurrency

  //   let bountyToken, bountyDecimals

  //   this.props.tokens.forEach(token => {
  //     if (token.symbol === bountySymbol) {
  //       bountyToken = token.addr
  //       bountyDecimals = token.decimals
  //     }
  //   })

  //   for (let key in issues) issuesArray.push({ key: key, ...issues[key] })

  //   const ipfsString = await computeIpfsString(issuesArray)

  //   const idArray = issuesArray.map(issue => web3.toHex(issue.repoId))
  //   const numberArray = issuesArray.map(issue => issue.number)
  //   const bountyArray = issuesArray.map(issue =>
  //     BigNumber(issue.size)
  //       .times(10 ** bountyDecimals)
  //       .toString()
  //   )
  //   const tokenArray = new Array(issuesArray.length).fill(bountyToken)
  //   const dateArray = new Array(issuesArray.length).fill(Date.now() + 8600)
  //   const booleanArray = new Array(issuesArray.length).fill(true)

  //   console.log('Submit issues:', issuesArray)
  //   this.props.app.addBounties(
  //     idArray,
  //     numberArray,
  //     bountyArray,
  //     dateArray,
  //     booleanArray,
  //     tokenArray,
  //     ipfsString,
  //     description
  //   )
  // }

  // const submitWork = issue => {
  //   this.setState((_prevState, _prevProps) => ({
  //     panel: PANELS.SubmitWork,
  //     panelProps: {
  //       onSubmitWork: this.onSubmitWork,
  //       githubCurrentUser: this.state.githubCurrentUser,
  //       issue,
  //     },
  //   }))
  // }

  // const onSubmitWork = async (state, issue) => {
  //   this.closePanel()
  //   const hash = await ipfsAdd(state)
  //   this.props.app.submitWork(web3.toHex(issue.repoId), issue.number, hash)
  // }

  // const requestAssignment = issue => {
  //   this.setState((_prevState, _prevProps) => ({
  //     panel: PANELS.RequestAssignment,
  //     panelProps: {
  //       onRequestAssignment: this.onRequestAssignment,
  //       githubCurrentUser: this.state.githubCurrentUser,
  //       issue,
  //     },
  //   }))
  // }

  // const onRequestAssignment = async (state, issue) => {
  //   this.closePanel()
  //   const hash = await ipfsAdd(state)
  //   this.props.app.requestAssignment(
  //     web3.toHex(issue.repoId),
  //     issue.number,
  //     hash
  //   )
  // }

  // const reviewApplication = issue => {
  //   this.setState((_prevState, _prevProps) => ({
  //     panel: PANELS.ReviewApplication,
  //     panelProps: {
  //       issue,
  //       onReviewApplication: this.onReviewApplication,
  //       githubCurrentUser: this.state.githubCurrentUser,
  //     },
  //   }))
  // }

  // const onReviewApplication = async (issue, requestIndex, approved, review) => {
  //   this.closePanel()
  //   // new IPFS data is old data plus state returned from the panel
  //   const ipfsData = issue.requestsData[requestIndex]
  //   ipfsData.review = review

  //   const requestIPFSHash = await ipfsAdd(ipfsData)

  //   this.props.app.approveAssignment(
  //     web3.toHex(issue.repoId),
  //     issue.number,
  //     issue.requestsData[requestIndex].contributorAddr,
  //     requestIPFSHash,
  //     approved
  //   )
  // }

  // const reviewWork = issue => {
  //   this.setState((_prevState, _prevProps) => ({
  //     panel: PANELS.ReviewWork,
  //     panelProps: {
  //       issue,
  //       onReviewWork: this.onReviewWork,
  //       githubCurrentUser: this.state.githubCurrentUser,
  //     },
  //   }))
  // }

  // const onReviewWork = async (state, issue) => {
  //   // new IPFS data is old data plus state returned from the panel
  //   const ipfsData = issue.workSubmissions[issue.workSubmissions.length - 1]
  //   ipfsData.review = state
  //   const requestIPFSHash = await ipfsAdd(ipfsData)

  //   this.closePanel()
  //   this.props.app.reviewSubmission(
  //     web3.toHex(issue.repoId),
  //     issue.number,
  //     issue.workSubmissions.length - 1,
  //     state.accepted,
  //     requestIPFSHash
  //   )
  // }

  // const curateIssues = issues => {
  //   this.setState((_prevState, _prevProps) => ({
  //     panel: PANELS.NewIssueCuration,
  //     panelProps: {
  //       issues: issues,
  //       onSubmit: this.onSubmitCuration,
  //       // rate: getSetting(SETTINGS.rate),
  //     },
  //   }))
  // }

  // const onSubmitCuration = (issues, description) => {
  //   this.closePanel()
  //   // TODO: maybe assign this to issueDescriptionIndices, not clear
  //   let issueDescriptionIndices = []
  //   issues.forEach((issue, i) => {
  //     if (i == 0) {
  //       issueDescriptionIndices.push(issue.title.length)
  //     } else {
  //       issueDescriptionIndices.push(issue.title.length)
  //     }
  //   })

  //   // TODO: splitting of descriptions needs to be fixed at smart contract level
  //   const issueDescriptions = issues.map(issue => issue.title).join('')
  //   /* TODO: The numbers below are supposedly coming from an eventual:
  //    issues.map(issue => web3.utils.hexToNum(web3.toHex(issue.repoId))) */
  //   const issueNumbers = issues.map(issue => issue.number)
  //   const emptyIntArray = new Array(issues.length).fill(0)
  //   const emptyAddrArray = [
  //     '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',
  //     '0xd00cc82a132f421bA6414D196BC830Db95e2e7Dd',
  //     '0x89c199302bd4ebAfAa0B5Ee1Ca7028C202766A7F',
  //     '0xd28c35a207c277029ade183b6e910e8d85206c07',
  //     '0xee6bd04c6164d7f0fa1cb03277c855639d99a7f6',
  //     '0xb1d048b756f7d432b42041715418b48e414c8f50',
  //     '0x6945b970fa107663378d242de245a48c079a8bf6',
  //     '0x83ac654be75487b9cfcc80117cdfb4a4c70b68a1',
  //     '0x690a63d7023780ccbdeed33ef1ee62c55c47460d',
  //     '0xb1afc07af31795d61471c169ecc64ad5776fa5a1',
  //     '0x4aafed050dc1cf7e349accb7c2d768fd029ece62',
  //     '0xd7a5846dea118aa76f0001011e9dc91a8952bf19',
  //   ]

  //   this.props.app.curateIssues(
  //     emptyAddrArray.slice(0, issues.length),
  //     emptyIntArray,
  //     issueDescriptionIndices,
  //     issueDescriptions,
  //     description,
  //     emptyIntArray,
  //     issueNumbers,
  //     1
  //   )
  // }

  // const cancelBounties = id => {
  //   console.log('closing')
  //   this.closePanel()
  // }

  // const closePanel = () => {
  //   this.setState({ panel: undefined, panelProps: undefined })
  // }

  // const handleGithubSignIn = () => {
  //   // The popup is launched, its ref is checked and saved in the state in one step
  //   this.setState(({ oldPopup }) => ({
  //     popup: githubPopup(oldPopup),
  //     githubLoading: true,
  //   }))
  //   // Listen for the github redirection with the auth-code encoded as url param
  //   window.addEventListener('message', this.handlePopupMessage)
  // }

  // const { activeIndex, panel, panelProps, githubCurrentUser } = this.state
  // const { bountySettings } = this.props

  return (
    <ApolloProvider client={this.state.client}>
      <ErrorBoundary>
        <AppContent
          onLogin={this.handleGithubSignIn}
          status={
            (this.props.github && this.props.github.status) || STATUS.INITIAL
          }
          app={this.props.app}
          bountySettings={bountySettings}
          githubCurrentUser={githubCurrentUser}
          githubLoading={this.state.githubLoading}
          projects={this.props.repos !== undefined ? this.props.repos : []}
          bountyIssues={
            this.props.issues !== undefined ? this.props.issues : []
          }
          bountySettings={bountySettings !== undefined ? bountySettings : {}}
          tokens={this.props.tokens !== undefined ? this.props.tokens : []}
          onNewProject={this.newProject}
          onRemoveProject={this.removeProject}
          onNewIssue={this.newIssue}
          onCurateIssues={this.curateIssues}
          onAllocateBounties={this.newBountyAllocation}
          onSubmitWork={this.submitWork}
          onRequestAssignment={this.requestAssignment}
          activeIndex={activeIndex}
          changeActiveIndex={this.changeActiveIndex}
          onReviewApplication={this.reviewApplication}
          onReviewWork={this.reviewWork}
        />

        <PanelManager
          onClose={this.closePanel}
          activePanel={panel}
          {...panelProps}
        />
      </ErrorBoundary>
    </ApolloProvider>
  )
}

const StyledAragonApp = styled(Main)`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
`

export default ProjectsContent
