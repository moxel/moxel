"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = ReactLoader;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _server = require("react-dom/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Page = _react2.default.createElement(
    "html",
    null,
    _react2.default.createElement(
        "head",
        null,
        _react2.default.createElement("script", null)
    ),
    _react2.default.createElement(
        "body",
        null,
        _react2.default.createElement(
            "h1",
            null,
            "this is great!"
        )
    )
);

function ReactLoader(req, res, next) {
    res.status(200).send((0, _server.renderToString)(Page));
}
//# sourceMappingURL=ReactLoader.js.map