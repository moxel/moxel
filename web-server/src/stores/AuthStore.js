import auth0 from 'auth0-js';
import Auth0Lock from 'auth0-lock'

var lockOptions = {
  theme: {
      logo: 'images/face.png', // TODO: fill-in lock here.,
      primaryColor: '#2196FA',
  },
  languageDictionary: {
      emailInputPlaceholder: "you@moxel.ai",
      title: "Moxel"
  },
  allowedConnections: ['Username-Password-Authentication'],
  rememberLastLogin: false, // disable sso.
  // redirect: false
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
        var redirectUrl = localStorage.getItem('auth0RedirectUrl');
        if(redirectUrl) {
          window.location.href = redirectUrl;
        }
      }.bind(this));
    }.bind(this));

    this.login = this.login.bind(this);
  }

	isAuthenticated() {
  	  if (localStorage.getItem('accessToken')) {
     	  	return true;
  	  }
  	  return false;
	}

	login(callbackPath) {
    if(!callbackPath) {
      callbackPath = '/';
    }
    var callbackURL = document.location.host + callbackPath;
    if(this.isAuthenticated()) {
      window.location.href = callbackPath;
      return;
    }

    // https://github.com/auth0/lock/issues/514
    // Auth0 Lock handles redirect before "authenticated" event.
    localStorage.setItem('auth0RedirectUrl', callbackURL);
    this.lock.show({
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
      console.log(profile);
      return profile;
  }

  username() {
      return this.profile().username;
  }

  email() {
      return this.profile().email;
  }
}

const AuthStore = new AuthStoreClass();

export default AuthStore;