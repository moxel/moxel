import React, {Component} from "react";
import FixedWidthRow from "../../components/fixed-width-row";

class Error404View extends Component {
	render() {
		return (
			<div>
				<FixedWidthRow>
					<h1><i className="material-icons left" style={{fontSize: "200px"}}>sentiment_dissatisfied</i></h1>
				</FixedWidthRow>
				<FixedWidthRow>
					<h4>404. We are not able to find it.</h4>
				</FixedWidthRow>
			</div>
		)
	}
};

export default Error404View;
