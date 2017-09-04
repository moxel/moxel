import auth0 from 'auth0-js';
import Auth0Lock from 'auth0-lock'

var lockOptions = {
  theme: {
      logo: '/images/x.png',
      primaryColor: '#2196FA',
  },
  languageDictionary: {
      emailInputPlaceholder: "you@moxel.ai",
      title: "Moxel"
  },
  // allowedConnections: ['google-oauth2', 'github', 'linkedin', 'Username-Password-Authentication'],
  allowedConnections: ['Username-Password-Authentication'],
  socialButtonStyle: 'small',
  rememberLastLogin: true, // disable sso.
  auth: {
    redirectUrl: window.location.protocol + '//' + window.location.host + '/logged-in'
  }
};

class AuthStoreClass {
  lock = new Auth0Lock(
    'MJciGnUXnD850clHoLM4tkltFlkgJGPs',
    'dummyai.auth0.com',
    lockOptions
  );

  constructor() {
    var lock = this.lock;
    
    lock.on("authenticated", function(authResult) {
      lock.getUserInfo(authResult.accessToken, function(error, profile) {
        if (error) {
          console.log('Error: ', error);
          return;
        }
        console.log('profile', profile);
        localStorage.setItem('accessToken', authResult.accessToken);
        localStorage.setItem('profile', JSON.stringify(profile));
      }.bind(this));
    }.bind(this));

    this.login = this.login.bind(this);
    this.loginOrSignup = this.loginOrSignup.bind(this);
  }

	isAuthenticated() {
  	  if (localStorage.getItem('accessToken')) {
     	  	return true;
  	  }
  	  return false;
	}

  loginOrSignup(callbackPath, lockOptions) {
    if(!callbackPath) {
      callbackPath = '/';
    }

    if(!lockOptions) {
      lockOptions = {};
    }

    lockOptions['connections'] = ['google', 'github', 'linkedin', 'facebook']
    lockOptions['socialBigButtons'] = 'true';

    var callbackURL = callbackPath;
    if(this.isAuthenticated()) {
      window.location.href = callbackPath;
      return;
    }

    // https://github.com/auth0/lock/issues/514
    // Auth0 Lock handles redirect before "authenticated" event.
    localStorage.setItem('auth0RedirectUrl', callbackURL);
    this.lock.show(lockOptions);
  }

	login(callbackPath) {
    var err = new Error();
    console.error(err.stack);
    this.loginOrSignup(callbackPath, {});
	}

  signup(callbackPath) {
    this.loginOrSignup(callbackPath, {
      initialScreen: 'signUp'
    });
  }

	logout() {
	  localStorage.removeItem('accessToken');	
    localStorage.removeItem('profile'); 
    this.lock.logout({ returnTo: window.location.protocol + '//' + window.location.host});
	}

  profile() {
    var rawProfile = localStorage.getItem('profile');
    if(!rawProfile) {
      this.login(window.location.pathname);
      throw "No profile is available."
      return;
    }
    var profile = JSON.parse(rawProfile);
    return profile;
  }

  username() {
    return this.profile().nickname;
  }

  email() {
    return this.profile().email;
  }

  picture() {
    return this.profile().picture;
  }
}

const AuthStore = new AuthStoreClass();

export default AuthStore;