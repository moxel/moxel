import React from "react";
import PropTypes from "prop-types";

function ModelView ({match, ..._props}) {
    const {user, modelId} = match.params;
    return (
        <div>{user + "/" + modelId}</div>
    );
}
ModelView.propTypes = {
    match: PropTypes.obj
};

export default  ModelView;
