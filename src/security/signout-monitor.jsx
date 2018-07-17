import React from 'react';
import { logger } from '../logger';
import { manager, oidcMetadata, getSessionId, getClientId, setUser } from './auth';

const log = logger('auth:session-monitor');

export default class SignOutMonitor extends React.Component {
  state = {};

  componentWillMount() {
    oidcMetadata().then(meta => {
      this.setState({ checkSessionUrl: meta.check_session_iframe });
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerInterval);
    window.removeEventListener('message', this.receiveMessage);
  }

  onIFrameLoad() {
    log('Activating session monitoring.');
    this.checkSession();
    this.timerInterval = setInterval(() => this.checkSession(), 5000);
    window.addEventListener('message', e => this.receiveMessage(e));
  }

  get sessionId() {
    return getSessionId();
  }

  get checkSessionUrl() {
    return this.state.checkSessionUrl;
  }

  checkSession() {
    const message = `${getClientId()} ${this.sessionId}`;
    if (message && this.checkSessionUrl && this.ifr && this.ifr.contentWindow) {
      log('checking oidc session: %s ===> %s', message, this.checkSessionUrl);
      this.ifr.contentWindow.postMessage(message, this.checkSessionUrl);
    }
  }

  receiveMessage(e) {
    log('Session monitoring iframe message: %O', e);
    // this is in an iframe
    if (e.data === 'changed') {
      log('User Session Changed: ', e);
      manager()
        .querySessionStatus()
        .then(u => log('Token refreshed %j', u))
        .catch(err => {
          log('Session no longer valid, logging user out. %j', err);
          setUser().then(() => {
            window.location.href = '/#/login';
          });
        });
    }
  }

  render() {
    return this.sessionId ? (
      <div>
        <iframe
          title="SingleLogoutIFrame"
          onLoad={() => this.onIFrameLoad()}
          sandbox="allow-same-origin allow-scripts"
          src={this.checkSessionUrl}
          ref={f => {
            this.ifr = f;
          }}
          style={{ display: 'none' }}
        />
      </div>
    ) : null;
  }
}
