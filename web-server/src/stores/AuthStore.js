// TODO: this is a mock. implement full user authentication flow.

class AuthStoreClass {
	isAuthenticated() {
    	if (localStorage.getItem('id_token')) {
      		return true;
    	}
    	return false;
  	}

  	setUser() {
  		localStorage.getItem('id_token', 'user'); 
  	}
}

const AuthStore = new AuthStoreClass();

export default AuthStore;