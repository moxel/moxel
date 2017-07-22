// TODO: this is a mock. implement full user authentication flow.

class AuthStoreClass {
	isAuthenticated() {
    	if (localStorage.getItem('id_token')) {
      		return true;
    	}
    	return false;
  	}

  	login() {
  		localStorage.setItem('id_token', 'user'); 
  	}

  	logout() {
  		localStorage.removeItem('id_token');	
  	}

    username() {
      return "strin";
    }
}

const AuthStore = new AuthStoreClass();

export default AuthStore;