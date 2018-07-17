// Libs
import React from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import { logger } from '../logger';
import { signIn } from './auth';
import { goto } from '../navigation';

const log = logger('auth:login-component');

export default class Login extends React.Component {
  componentWillMount() {
    signIn({ silent: true, redirectToLogin: false }).then(x => {
      console.log('--->', x);
      if (x) goto('/');
    });
  }

  componentDidMount() {
    document.body.classList.add('login-page');
  }

  componentWillUnmount() {
    document.body.classList.remove('login-page');
  }

  login() {
    log('Manual log  in...');
    signIn({ silent: false });
  }

  render() {
    return (
      <Grid className="content">
        <Row>
          <Col xs={7} sm={6} className="col-xxs-12">
            <h1>
              Please sign in to access <strong>eSante apps.</strong>
            </h1>
            <Button bsStyle="success" bsSize="large" onClick={() => this.login()}>
              <i className="zmdi zmdi-lock zmdi-invert-colors" />
              Sign In
            </Button>
          </Col>
        </Row>
      </Grid>
    );
  }
}
