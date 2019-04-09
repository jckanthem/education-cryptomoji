import React from "react";
import {
  fetchState,
  fetchStatePartial,
  sendBatch
} from "../services/apiRoutes.js";
import { encodeAll } from "../services/transactions.js";
import { createKeys } from "../services/signing.js";

class SignIn extends React.Component {
  constructor() {
    super();
    this.state = {
      privateKey: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit;
  }
  handleChange(e) {
    e.persist();
    this.setState({ privateKey: e.target.value });
  }
  render() {
    return (
      <div id="signin">
        <h2> Sign In </h2>
        <span>Enter Private Key</span>
        <input onChange={this.handleChange} />
        <button
          type="button"
          onClick={() => this.props.handleSubmit(this.state.privateKey)}
        >
          Log in
        </button>
      </div>
    );
  }
}
export default SignIn;
