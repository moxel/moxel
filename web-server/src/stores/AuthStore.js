import auth0 from 'auth0-js';
import Auth0Lock from 'auth0-lock'

var lockOptions = {
  theme: {
      logo: '/images/x.png',
      primaryColor: '#2196FA',
  },
  languageDictionary: {
      emailInputPlaceholder: "your email",
      title: "Moxel"
  },
  // allowedConnections: ['google-oauth2', 'github', 'linkedin', 'Username-Password-Authentication'],
  allowedConnections: ['Username-Password-Authentication'],
  socialButtonStyle: 'small',
  rememberLastLogin: true, // disable sso.
  auth: {
    redirectUrl: window.location.protocol + '//' + window.location.host + '/logged-in',
    params: {scope: "openid user_metadata picture", audience: "https://dummyai.auth0.com/api/v2/"},
  }
};

const AUTH0_DOMAIN = 'dummyai.auth0.com';

class AuthStoreClass {
  lock = new Auth0Lock(
    'MJciGnUXnD850clHoLM4tkltFlkgJGPs',
    AUTH0_DOMAIN,
    lockOptions
  );

  constructor() {
    var lock = this.lock;
    
    this.login = this.login.bind(this);
    this.loginOrSignup = this.loginOrSignup.bind(this);
    this.getProfileByUser = this.getProfileByUser.bind(this);
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

  metadata() {
    return this.profile().user_metadata;
  }

  fullName() {
    return this.metadata()['full_name'];
  }

  email() {
    return this.profile().email;
  }

  picture() {
    return this.profile().picture;
  }

  auth0UserId() {
    var profile = this.profile();
    return profile['user_id'];
  }

  accessToken() {
    var accessToken = localStorage.getItem('accessToken');
    if(!accessToken) {
      this.login(window.location.pathname);
      throw "No accessToken is available."
      return "";
    }
    return accessToken;
  }

  updateProfile(data) {
    console.log('updateProfile', this);
    var uid = this.auth0UserId();
    var accessToken = this.accessToken();

    return new Promise((resolve, reject) => {
      fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${uid}`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }),
        body: JSON.stringify(data)
      }).then((response)=>{
        return response.json();
      }).then((profile) => {
        localStorage.setItem('profile', JSON.stringify(profile));
        resolve(profile);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getProfileByUser(userId) {
    var self = this;

    return new Promise(function(resolve, reject) {
      fetch(`/api/users/${userId}`, {
        method: 'GET'
      }).then((response)=>{
        return response.json();
      }).then((result) => {
        resolve(result);          
      })
    });
  }
}

const AuthStore = new AuthStoreClass();

export default AuthStore;