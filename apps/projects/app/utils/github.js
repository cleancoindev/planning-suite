import ApolloClient from 'apollo-boost'

const STATUS = {
  INITIAL: 'initial',
  AUTHENTICATED: 'authenticated',
  FAILED: 'failed',
}
// TODO: STATUS.loading with a smooth transition component

const GITHUB_URI = 'https://github.com/login/oauth/authorize'

// // TODO: let the user customize the github app on settings screen?
// // TODO: Extract to an external js utility to keep this file clean
// // Variable fields depending on the execution environment:
// // TODO: This should be dynamically set depending on the execution environment (dev, prod...)

// export const githubPopup = (popup = null) => {
//   // Checks to save some memory if the popup exists as a window object
//   if (popup === null || popup.closed) {
//     popup = window.open(
//       // TODO: Improve readability here: encode = (params: Object) => (JSON.stringify(params).replace(':', '=').trim())
//       // encode url params
//       `${GITHUB_URI}?client_id=${CLIENT_ID}&scope=public_repo&redirect_uri=${REDIRECT_URI}`,
//       // `${REDIRECT_URI}/?code=232r3423`, // <= use this to avoid spamming github for testing purposes
//       'githubAuth',
//       // TODO: Improve readability here: encode = (fields: Object) => (JSON.stringify(fields).replace(':', '=').trim())
//       `scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no, ${getPopupDimensions()}`
//     )
//   } else popup.focus()
//   return popup
// }

// export const getPopupDimensions = () => {
//   const { width, height } = getPopupSize()
//   const { top, left } = getPopupOffset({ width, height })
//   return `width=${width},height=${height},top=${top},left=${left}`
// }

// export const getPopupSize = () => {
//   return { width: 650, height: 850 }
// }

// export const getPopupOffset = ({ width, height }) => {
//   const wLeft = window.screenLeft ? window.screenLeft : window.screenX
//   const wTop = window.screenTop ? window.screenTop : window.screenY

//   const left = wLeft + window.innerWidth / 2 - width / 2
//   const top = wTop + window.innerHeight / 2 - height / 2

//   return { top, left }
// }

// export const getURLParam = param => {
//   const searchParam = new URLSearchParams(window.location.search)
//   return searchParam.get(param)
// }

// export const initApolloClient = token =>
//   new ApolloClient({
//     uri: 'https://api.github.com/graphql',
//     request: operation => {
//       if (token) {
//         operation.setContext({
//           headers: {
//             accept: 'application/vnd.github.starfire-preview+json', // needed to create issues
//             authorization: `bearer ${token}`,
//           },
//         })
//       }
//     },
//   })

// /**
//  * Sends an http request to the AUTH_URI with the auth code obtained from the oauth flow
//  * @param {string} code
//  * @returns {string} The authentication token obtained from the auth server
//  */
// export const getToken = async code => {
//   const response = await fetch(`${AUTH_URI}/${code}`)
//   const json = await response.json()
//   return json.token
// }

// export const checkForCode = () => {
//   /**
//    * Acting as the redirect target it looks up for 'code' URL param on component mount
//    * if it detects the code then sends to the opener window
//    * via postMessage with 'popup' as origin and close the window (usually a popup)
//    */
//   const code = getURLParam('code')
//   code &&
//     window.opener.postMessage({ from: 'popup', name: 'code', value: code }, '*')
//   window.close()
// }

export { STATUS }
