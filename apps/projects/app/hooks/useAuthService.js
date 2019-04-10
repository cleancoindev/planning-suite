import React from 'react'

const useAuthService = () => {
  let clientId, redirectURI, authURI

  switch (window.location.origin) {
  case 'http://localhost:3333':
    clientId = 'd556542aa7a03e640409'
    redirectURI = 'http://localhost:3333'
    authURI = 'https://tps-github-auth.now.sh/authenticate'
    // TODO: change auth service to be more explicit to:
    // AUTH_URI = 'https://dev-tps-github-auth.now.sh/authenticate'
    break
  case 'http://localhost:8080':
    clientId = '686f96197cc9bb07a43d'
    redirectURI = window.location.href
    authURI = 'https://local-tps-github-auth.now.sh/authenticate'
    break
  default:
    console.log(
      'GitHub OAuth: Scenario not implemented yet, GitHub API disabled for the current Projects App deployment'
    )
    break
  }

  return { authURI, clientId, redirectURI }
}

export default useAuthService
