import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { STATUS } from '../../utils/github'
import { Project, Empty, Error } from '../Card'
import Unauthorized from './Unauthorized'
import { LoadingAnimation } from '../Shared'
import { EmptyWrapper } from '../Shared'
import { Viewport } from '@aragon/ui'
import { CARD_STRETCH_BREAKPOINT } from '../../utils/responsive'

const Overview = ({
  changeActiveIndex,
  onLogin,
  projects,
  githubLoading,
  status,
}) => {
  if (githubLoading) {
    return (
      <EmptyWrapper>
        <LoadingAnimation />
      </EmptyWrapper>
    )
  } else if (status === STATUS.INITIAL) {
    return <Unauthorized onLogin={onLogin} />
  } else if (status === STATUS.FAILED) {
    return <Error action={() => {}} />
  }

  const projectsEmpty = projects.length === 0
  if (projectsEmpty) {
    return <Empty />
  }

  return (
    <Viewport>
      {({ width }) => (
        <StyledProjects screenSize={width}>
          {projects.map((project, index) => (
            <Project
              key={index}
              label={project.metadata.name}
              description={project.metadata.description}
              id={project.id}
              repoId={project.data._repo}
              commits={project.metadata.commits}
              screenSize={width}
              // TODO: Disabled for now
              // contributors={project.metadata.collaborators}
              url={project.metadata.url}
              changeActiveIndex={changeActiveIndex}
            />
          ))}
        </StyledProjects>
      )}
    </Viewport>
  )
}

Overview.propTypes = {
  changeActiveIndex: PropTypes.func.isRequired,
  githubLoading: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  status: PropTypes.oneOf([
    STATUS.AUTHENTICATED,
    STATUS.FAILED,
    STATUS.INITIAL,
  ]).isRequired,
}

const StyledProjects = styled.div`
  display: flex;
  flex-direction: ${props =>
    props.screenSize < CARD_STRETCH_BREAKPOINT ? 'column' : 'row'};
  flex-wrap: wrap;
`
export default Overview
