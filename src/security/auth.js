import Oidc from 'oidc-client';
import axios from 'axios';
import { intersection, isEmpty } from 'lodash';
import url from 'url';
import { logger } from '../logger';
import { goto } from '../navigation';
import loadProfile from './profile';

Oidc.Log.logger = {
  log: logger('oidc-client:log'),
  debug: logger('oidc-client:debug'),
  error: logger('oidc-client:error'),
  info: logger('oidc-client:info'),
  warn: logger('oidc-client:warn')
};

const log = logger('auth:core');
/*
currentUser: {
  id_token: The id_token returned from the OIDC provider.
  profile: The claims represented by a combination of the id_token and the user info endpoint.
  session_state: The session state value returned from the OIDC provider.
  access_token: The access token returned from the OIDC provider.
  scope: The scope returned from the OIDC provider.
  expires_at: The expires at returned from the OIDC provider.
  expires_in: Calculated number of seconds the access token has remaining.
  expired: Calculated value indicating if the access token is expired.
  scopes: Array representing the parsed values from the scope.
}
*/

let oidcManager;
let _currentUser;

export function manager() {
  if (!oidcManager) {
    throw Error('Authentication has not been configured. Call initialized first!');
  }
  return oidcManager;
}

function clearUser() {
  log('Clearing out user data.');
  // oidcManager.removeUser();
  _currentUser = null;
  return _currentUser;
}

export function setUser(oauthUser) {
  log('Setting user to: %s', JSON.stringify(oauthUser, null, 2));
  if (oauthUser && oauthUser.profile && oauthUser.profile.sub) {
    return Promise.all([oauthUser, loadProfile(oauthUser.profile.sub)])
      .then(userData => {
        log('Setting user from %j and %j', userData[0], userData[1]);
        _currentUser = { ...userData[0], ...userData[1], session_state: oauthUser && oauthUser.session_state };
        return _currentUser;
      })
      .catch(err => {
        log('Failed to load user profile %j.', err);
        return clearUser();
      });
  }
  log('No user to set %j. Clearing out user data', oauthUser);
  return Promise.resolve(clearUser());
}

/**
 * Follows an oidc promise such as signinSilent or signinRedirectCallback,
 * loads the user and mark the app as authenticated.
 * @param {any} userPromise - OidcLcient user manager signinSilent or signinRedirectCallback promise.
 * @param {boolean} [redirectToLogin=true] -indicates whether or not in case of promise failure
 * (such as the user not being authenticated) the app is redirected to the login page
 * @returns a promise with the full user (oidc + provisioning data)
 */
function loadUser(userPromise, redirectToLogin = true) {
  return userPromise.then(user => setUser(user)).then(user => {
    if (!user) {
      if (redirectToLogin) {
        log('redirecting to login %s', redirectToLogin);
        goto('/login');
      } else {
        log('skipping login %s', redirectToLogin);
      }
    }
    return user;
  });
}

function prepare(oidcSettings) {
  const preparedSettings = Object.assign(oidcSettings, {
    loadUserInfo: false,
    accessTokenExpiringNotificationTime: 60,
    automaticSilentRenew: true,
    revokeAccessTokenOnSignout: true,
    monitorSession: true
  });
  if (preparedSettings.metadata) return Promise.resolve(preparedSettings);
  // we load metadata manually and alter per need
  return axios.get(preparedSettings.authority).then(m => {
    const meta = m.data;
    const checkSessionUrl = url.parse(meta.check_session_iframe);
    checkSessionUrl.query = checkSessionUrl.query || {};
    checkSessionUrl.query.client_id = preparedSettings.client_id;
    checkSessionUrl.query.redirect_uri = preparedSettings.redirect_uri;
    meta.check_session_iframe = url.format(checkSessionUrl);
    const settings = preparedSettings;
    settings.metadata = meta;
    return settings;
  });
}

export function initialize(authSettings) {
  if (!authSettings.oidc) return Promise.reject(new Error('OIDC settings cannot be found part of AUTH configuration.'));

  return prepare(authSettings.oidc).then(settings => {
    // console.log(`OIDC METADATA: ${JSON.stringify(settings, null, 2)}`);

    oidcManager = new Oidc.UserManager(settings);
    oidcManager.events.addAccessTokenExpiring(e => {
      log('token expiring %j', e);
    });

    oidcManager.events.addAccessTokenExpired(e => {
      log('token expired %j', e);
    });

    oidcManager.events.addSilentRenewError(e => {
      log('silent renew error %j', e);
    });

    oidcManager.events.addUserLoaded(u => {
      log('user loaded', u);
      setUser(u);
    });

    oidcManager.events.addUserUnloaded(e => {
      log('user unloaded: %j', e);
      setUser();
    });
    return settings;
  });
}

export function signIn(opt = {}) {
  const { silent, redirectToLogin } = { silent: false, redirectToLogin: true, ...opt };
  log('Signing in %j', { silent, redirectToLogin });
  if (silent) {
    return manager()
      .signinSilent()
      .catch(err => {
        log('silent log in failed: %j', err);
        return null;
      })
      .then(u => {
        log('silent signin user -------> ', u);
        if (redirectToLogin) {
          log('redirecting to login %j', redirectToLogin);
          goto('/login');
        }
        log('skipping login %j', redirectToLogin);
        if (u && !_currentUser) {
          return setUser(u).then(usr => Promise.resolve(usr));
        }
        return Promise.resolve(_currentUser);
      });
  }
  return manager().signinRedirect();
}

export function signInVerify() {
  return loadUser(manager()
    .signinRedirectCallback()
    .catch(err => {
      log('Callback call invalid. Error: %j', err);
      return null;
    })).then(user => {
    if (!user) {
      log('redirecting to login');
      goto('/login');
    }
  });
}

export function signOut() {
  log('Signing out user');
  manager().signoutRedirect();
}

export function isLoggedIn() {
  return !!oidcManager && !!_currentUser;
}

export function getUser() {
  return oidcManager && _currentUser;
}

export function getManagerUser() {
  return oidcManager.getUser();
}

export function getAccessToken() {
  return oidcManager && _currentUser && _currentUser.access_token;
}

export function getClientId() {
  return oidcManager && oidcManager.settings.client_id;
}
export function oidcMetadata() {
  return oidcManager ? oidcManager.metadataService.getMetadata() : Promise.resolve(null);
}

/**
 * returns the session identifier for the current session.
 * When using WSO2 this is the session_state part of the oauth user object
 */
export function getSessionId() {
  return oidcManager && _currentUser && _currentUser.session_state;
}

export function isMemberOf(groups) {
  let result = false;
  if (isLoggedIn()) {
    if (isEmpty(groups)) {
      result = true;
    } else {
      const userGroups = (_currentUser && _currentUser.groups) || [];
      result = !isEmpty(intersection(userGroups, groups));
    }
  }
  return result;
}
