import { hot } from 'react-hot-loader'
import { map } from 'rxjs/operators'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import { AppView, Main, observe, TabBar } from '@aragon/ui'

import { useAuthService } from '../../hooks'
import { STATUS } from '../../utils/github'
import { ipfsAdd, computeIpfsString } from '../../utils/ipfs-helpers'
import PanelManager, { PANELS } from '../Panel'
import { AppContent } from '.'
import ErrorBoundary from './ErrorBoundary'

const SCREENS = [ 'Overview', 'Issues', 'Settings' ]

const initApolloClient = token =>
  new ApolloClient({
    uri: 'https://api.github.com/graphql',
    request: operation => {
      if (token) {
        operation.setContext({
          headers: {
            accept: 'application/vnd.github.starfire-preview+json', // needed to create issues
            authorization: `bearer ${token}`,
          },
        })
      }
    },
  })

const ProjectsApp = ({
  app,
  bountySettings = {},
  github = { status: STATUS.INITIAL },
  issues = [],
  repos = [],
  tokens = [],
}) => {
  const [ screen, setScreen ] = useState(0)
  const [ panel, setPanel ] = useState()
  const [ panelProps, setPanelProps ] = useState()
  const [ currentGithubUser, setCurrentGithubUser ] = useState()
  const [ apolloClient, setApolloClient ] = useState(
    initApolloClient(github.token || '')
  )
  const [ githubLoading, setGithubLoading ] = useState(false)

  const { authURI, clientId, redirectURI } = useAuthService()

  useEffect(
    () => {
      const initializeApollo = async () => {
        if (github.token) {
          const client = initApolloClient(github.token)
          const data = await client.query({
            query: CURRENT_USER,
          })
          setApolloClient(client), setGithubCurrentUser(data.viewer)
        }
      }
      initializeApollo()
    },
    [github]
  )

  const closePanel = () => {
    setPanel(null)
  }

  // TODO: memoize:
  // const loadPanelProps = memo(PANEL_PROPS[panel])

  // Main functions TODO: move to reducer

  /**
   * Probably external candidate functions
   */
  const handlePopupMessage = async message => {
    if (message.data.from !== 'popup') return
    if (message.data.name === 'code') {
      // TODO: Optimize the listeners lifecycle, ie: remove on unmount
      window.removeEventListener('message', messageHandler)

      const code = message.data.value
      let event, status, token

      try {
        event = REQUESTED_GITHUB_TOKEN_FAILURE
        status = STATUS.FAILED
        token = await getToken(code)
      } catch (err) {
        console.log('handlePopupMessage', err)
        event = REQUESTED_GITHUB_TOKEN_FAILURE
        status = STATUS.FAILED
        token = null
      }
      setGithubLoading(false)
      setPanelProps({
        onCreateProject,
        status,
      })
      app.cache('github', {
        event,
        status,
        token,
      })
    }
  }

  const handleGithubSignIn = () => {
    // The popup is launched, its ref is checked and saved in the state in one step
    setPopup(githubPopup(oldPopup))
    setGithubLoading(true)
    // Listen for the github redirection with the auth-code encoded as url param
    window.addEventListener('message', handlePopupMessage)
  }

  /**
   * Form submission functions (contract calls)
   */

  const onCreateProject = ({ owner, project }) => {
    closePanel()
    app.addRepo(web3.toHex(project), web3.toHex(owner))
  }

  const onReviewWork = async (state, issue) => {
    // new IPFS data is old data plus state returned from the panel
    const ipfsData = issue.workSubmissions[issue.workSubmissions.length - 1]
    ipfsData.review = state
    const requestIPFSHash = await ipfsAdd(ipfsData)

    closePanel()
    app.reviewSubmission(
      web3.toHex(issue.repoId),
      issue.number,
      issue.workSubmissions.length - 1,
      state.accepted,
      requestIPFSHash
    )
  }

  /**
   * Panel loading functions
   */

  const newIssue = () => {
    const reposManaged =
      repos.map(repo => ({
        name: repo.metadata.name,
        id: repo.data._repo,
      })) || 'No repos'
    const reposIds = repos.map(repo => repo.data.repo) || []

    setPanel(PANELS.NewIssue)
    setPanelProps({
      reposManaged,
      closePanel,
      reposIds,
    })
  }

  // TODO: Review
  // This is breaking RepoList loading sometimes preventing show repos after login
  const newProject = () => {
    const reposAlreadyAdded = repos ? repos.map(repo => repo.data._repo) : []

    setPanel(PANELS.NewProject)
    setPanelProps({
      onCreateProject: createProject,
      onGithubSignIn: handleGithubSignIn,
      reposAlreadyAdded,
      status: status,
    })
  }

  const reviewWork = issue => {
    setPanel(PANELS.ReviewWork)
    setPanelProps({ issue, onReviewWork, currentGithubUser })
  }

  return (
    <Main>
      <AppView
        title="Projects"
        tabs={<TabBar items={SCREENS} selected={screen} onSelect={setScreen} />}
      >
        <ApolloProvider client={apolloClient}>
          <ErrorBoundary>
            <AppContent
              activeIndex={screen}
              app={app}
              bountyIssues={issues}
              bountySettings={bountySettings}
              changeActiveIndex={setScreen}
              githubCurrentUser={currentGithubUser}
              githubLoading={githubLoading}
              onLogin={handleGithubSignIn}
              onNewIssue={newIssue}
              onNewProject={newProject}
              onReviewWork={reviewWork}
              projects={repos}
              status={github.status}
              tokens={tokens}
              // onRemoveProject={removeProject}
              // onCurateIssues={curateIssues}
              // onAllocateBounties={newBountyAllocation}
              // onSubmitWork={submitWork}
              // onRequestAssignment={requestAssignment}
              // onReviewApplication={reviewApplication}
            />

            <PanelManager
              onClose={closePanel}
              activePanel={panel}
              {...panelProps}
            />
          </ErrorBoundary>
        </ApolloProvider>
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
