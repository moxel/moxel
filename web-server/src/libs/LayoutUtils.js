// Layout related utilities.
class LayoutUtilsClass {
	constructor() {
		
	}

	isMobile() {
		var screenWidth = window.innerWidth;
		return screenWidth <= 900;    
	}
}

const LayoutUtils = new LayoutUtilsClass();

export default LayoutUtils;