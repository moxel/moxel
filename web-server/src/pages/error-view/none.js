import React, {Component} from "react";
import FixedWidthRow from "../../components/fixed-width-row";

class ErrorNoneView extends Component {
	render() {
		return (
			<div>
				<FixedWidthRow>
					<h1><i className="material-icons left" style={{fontSize: "200px"}}>sentiment_dissatisfied</i></h1>
				</FixedWidthRow>
				<FixedWidthRow>
					<h4>Sorry, model does not exist...</h4>
				</FixedWidthRow>
			</div>
		)
	}
};

export default ErrorNoneView;
