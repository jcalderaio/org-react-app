import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../logger';
import { goto } from '../navigation';
import { getManagerUser, setUser, isMemberOf, signIn } from './auth';

const log = logger('auth:route-guardian');

export default function RouteGuardian(...allowed) {
  return class RouteGuardianComponent extends React.Component {
    static propTypes = { children: PropTypes.element.isRequired };

    state = { accessDenied: true };

    componentWillMount() {
      return getManagerUser().then(u => {
        return setUser(u);
      }).then(usr => {
        if (!usr) {
          return signIn({ silent: true })
            .then(user => user && this.checkAuthorization());
        }
        return usr && this.checkAuthorization();
      });
    }

    get isAccessDenied() {
      return !isMemberOf(allowed);
    }

    checkAuthorization() {
      const accessDenied = this.isAccessDenied;
      if (accessDenied) {
        log('Access denied');
        goto('/unauthorized');
      } else {
        setTimeout(this.setState({ accessDenied: false }), 500);
      }
    }

    render() {
      return this.state.accessDenied ? null : React.Children.only(this.props.children);
    }
  };
}
