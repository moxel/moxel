import auth0 from 'auth0-js';
import Auth0Lock from 'auth0-lock'

var lockOptions = {
  theme: {
      logo: 'images/face.png', // TODO: fill-in lock here.,
      primaryColor: '#2196FA',
  },
  languageDictionary: {
      emailInputPlaceholder: "you@dummy.ai",
      title: "Dummy.ai"
  },
  allowedConnections: ['Username-Password-Authentication'],
  rememberLastLogin: false // disable sso.
};

class AuthStoreClass {
  lock = new Auth0Lock(
    'MJciGnUXnD850clHoLM4tkltFlkgJGPs',
    'dummyai.auth0.com',
    lockOptions
  );

  constructor() {
      var lock = this.lock;
      var callbackURL = '/';
      lock.on("authenticated", function(authResult) {
        console.log('hi');
        lock.getUserInfo(authResult.accessToken, function(error, profile) {
          if (error) {
            console.log('Error: ', error);
            return;
          }
          console.log('profile', profile);
          localStorage.setItem('accessToken', authResult.accessToken);
          localStorage.setItem('profile', JSON.stringify(profile));
          window.location.href = callbackURL;
        });
      });
  }

	isAuthenticated() {
  	  if (localStorage.getItem('accessToken')) {
     	  	return true;
  	  }
  	  return false;
	}

	login(callbackURL) {
      this.lock.show();
	}

	logout() {
		  localStorage.removeItem('accessToken');	
      this.lock.logout({ returnTo: window.location.protocol + '//' + window.location.host});
	}

  profile() {
      var profile = JSON.parse(localStorage.getItem('profile'));
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