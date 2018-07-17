import React from 'react';
import PropTypes from 'prop-types';
import IdleTimer from 'react-idle-timer';
import withUser from './with-user';
import withConfig from '../configuration/with-config';
import SignOutMonitor from './signout-monitor';
import { signOut } from './auth';
import { logger } from '../logger';

const log = logger('auth:container');

class AuthenticatedContainer extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    user: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired
  };

  onIdle() {
    log('Session timeout');
    signOut();
  }

  render() {
    const { children, user, config } = this.props;
    const timeoutInSeconds = (config.auth && config.auth.sessionTimeout) || 900; // default to 15min
    return (
      user && (
        <div>
          <SignOutMonitor />
          <IdleTimer timeout={timeoutInSeconds * 1000} idleAction={() => this.onIdle()}>
            {children}
          </IdleTimer>
        </div>
      )
    );
  }
}

export default withUser(withConfig(AuthenticatedContainer));
