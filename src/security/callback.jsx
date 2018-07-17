import React from 'react';
import { signInVerify } from './auth';
import { goto } from '../navigation';
import { logger } from '../logger';

const log = logger('auth:callback');

export default class Callback extends React.Component {
  componentDidMount() {
    signInVerify()
      .then(user => this.onRedirectSuccess(user))
      .catch(error => this.onRedirectError(error));
  }

  onRedirectSuccess(user) {
    log('OIDC Success: %j', user);
    const redirectUrl = '/';
    // if (this.props.returnTo && this.props.returnTo !== 'undefined') {
    //   redirectUrl = decodeURIComponent(this.props.returnTo);
    // }
    goto(redirectUrl);
    // window.top.location = redirectUrl;
  }

  onRedirectError(err) {
    log('OIDC Failed: %o', err);
    // UserManager.instance.removeUser().then(() => {
    //   window.top.location.href = '/login.html';
    // });
    /*
      In the SsoLogout component, it listens for a change in session state
      When the change in session state occurs, the userManager.signinSilent method is called
      If the signinSilent method is successful (user signed into another app), the success callback is hit
      If the signinSilent method fails (user has logged out of another app), the error callback is hit
      When the error callback is hit, the userManager.removeUser method is called and
      user is redirected back to CallbackPage screen via user unloaded event in userManager
    */
  }

  render() {
    return (
      <div id="redirecting">
        <h1>Redirecting...</h1>
        <div className="preloader" />
      </div>
    );
  }
}
