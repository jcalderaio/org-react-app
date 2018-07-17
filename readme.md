# React App

ReactApp is the main npm module to use when building React applications in Cognosante. It is a generic library that provides features such as:

- *Application configuration*: loading configs and making them available to components
- *Security*: signIn, signOut, React-router protection, etc


## Application Configuration

ReactApp handles the loading of the configuration for your web application. The configuration is loaded once when the application starts. In order for a component to access the application config the *withConfig* HOC should be used that will inject the config into the component as a property named `config`.

## Security

ReactApp takes care of the entire security concern for the web application. It offers functionality such as signing in, signing out, retrieving the logged in user, retrieving the tokens, etc. It works in conjuction with **react-router** to ensure protection of urls and routes.

If a component needs access to the currently logged in user, the **withUser** HOC component can be used to inject the logged in user into the component, making it available as a property named `user`.

- **signOut**: function that will log out the user from the system and redirect to login screen
- **withUser**: hoc that will inject the logged in user into your component as a property
- **history**: react router application history. This needs to be used when setting up react router in your application
- **goto**: function that will redirect you to the path desired. Use this instread of the react-router provided functionality for triggered navigation

### Putting it all together

- **AppHost**: this is the main container component that should be used as a root node and enclose the actual application in it. It loads the configuration and initializes the security/authentication for the app.


1. Use **AppHost** to wrap your application

```js
export default function Application() {
  return (
    <AppHost>
      <YourApp />
    </AppHost>
  );
}
```

2. Create your application router and use RouteGuardian to protect your routes. In your router.jsx protect any routes with the **RouteGuardian** that will enforce authentication and authorization.

```js
<Router history={history}>
    <Route path="/">
      <IndexRedirect to="portal" />
      <Route component={RouteGuardian()}>
        <Route component={PortalTemplate}>
          <Route path="portal" component={ProviderPortal} />
          <Route component={RouteGuardian('administrator')}>
            <Route path="settings" component={AppSettings} />
          </Route>
          <Route component={RouteGuardian('provider')}>
            <Route path="myPatients" component={MyPatientsContainer} />
          </Route>
        </Route>
      </Route>

      <Route component={PublicTemplate}>
        <Route path="callback" component={Callback} />
        <Route path="login" component={Login} />
        <Route path="unauthorized" component={NotAuthorizedPage} />
        <Route path="*" component={NotFound} />
      </Route>
    </Route>
  </Router>
```

3. Use provided **signOut** method in the template(s) where you need to trigger a user log out.

```js
import { signOut } from '@cognosante/react-app';

function MySiteTemplate(props) {
  return (
    <div>
      <Nav>
        <Button onClick={signOut}></Button>
      </Nav>
      <main>{props.children}</main>
    </div>
  );
}

```

4. Where you need the configuration use the provided HOC method **withConfig** to get access to it

```js
import { withConfig } from '@cognosante/react-app'

function MyComponent(props) {
  return <span>This is an app component</span>;
}

export default withConfig(MyComponent);
```

5. Where you need the currently logged in user, use the provided HOC method **withUser** to get access to it

```js
import { withUser } from '@cognosante/react-app'

function MyComponent(props) {
  return <span>Currently logged in user is: {props.user.username}</span>;
}

export default withUser(MyComponent);
```
