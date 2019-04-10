import PropTypes from 'prop-types'
import React from 'react'

import { STATUS } from '../../utils/github'
import { TabbedView, TabBar, TabContent, Tab } from '../TabbedView'

// TODO: improve structure:
/*
  contentData = [
    {
      title, // merge with screen -> add name to the components
      screen,
      button: { title, actions: [] },
      panel: { content, title },
      empty: { title, text, icon, button: { action, title } }
    }
  ]
*/

// TODO: Dynamic component loading

const AppContent = ({ activeIndex, contentData, ...props }) => {
  console.log('AppContent tokens: ', props.tokens)

  return (
    <React.Fragment>
      {/* <TabbedView
        activeIndex={props.activeIndex}
        changeActiveIndex={props.changeActiveIndex}
      >
        <TabBar>
          {contentData.map(({ tabName }) => (
            <Tab key={tabName}>{tabName}</Tab>
          ))}
        </TabBar> */}
      <TabContent>
        {contentData.map(({ TabComponent }, i) => (
          <TabComponent key={i} {...props} />
        ))}
      </TabContent>
      {/* </TabbedView> */}
    </React.Fragment>
  )
}

AppContent.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  bountyIssues: PropTypes.arrayOf(PropTypes.object).isRequired,
  tokens: PropTypes.arrayOf(PropTypes.object).isRequired,
  bountySettings: PropTypes.object.isRequired,
  onNewProject: PropTypes.func.isRequired,
  onNewIssue: PropTypes.func.isRequired,
  activeIndex: PropTypes.number.isRequired,
  changeActiveIndex: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
}

export default AppContent
