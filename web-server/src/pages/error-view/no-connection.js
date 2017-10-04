import React, {Component} from "react";
import FixedWidthRow from "../../components/fixed-width-row";

class ErrorNoConnectionView extends Component {
	render() {
		return (
			<div>
				<FixedWidthRow>
					<h1><i className="material-icons left" style={{fontSize: "200px"}}>sentiment_dissatisfied</i></h1>
				</FixedWidthRow>
				<FixedWidthRow>
					<h4>Sorry... We are not able to connect to Moxel.</h4>
				</FixedWidthRow>
			</div>
		)
	}
};

export default ErrorNoConnectionView;
