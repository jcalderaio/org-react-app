// Libs
import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

export default function NotAuthorized() {
  return (
    <Grid className="content">
      <div className="page-not-found">
        <Row>
          <Col sm={12}>
            <h1 className="page-heading">Oops! You Are Not Authorized To See This Page. </h1>
            <p>
              <i className="icon-no-results zmdi zmdi-mood-bad" />
            </p>
            <p>
              We&#39;re sorry but we can&#39;t show you the page you&#39;re looking for, because you don&#39;t seem to
              have the proper authorization.
            </p>
            <p>Please contact your administrator for more details.</p>
          </Col>
        </Row>
      </div>
    </Grid>
  );
}
