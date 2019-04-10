import React from "react";
import {
  fetchState,
  fetchStatePartial,
  sendBatch
} from "../services/apiRoutes.js";
import { encodeAll } from "../services/transactions.js";
import { createKeys } from "../services/signing.js";
class SignIn extends React.Component {
  constructor(props) {
    super();
    this.state = {
      privateKey: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    e.persist();
    this.setState({ privateKey: e.target.value });
  }
  render() {
    return (
      <div id="signin">
        <h2> Sign In </h2>
        <input placeholder="Enter Private Key" onChange={this.handleChange} />
        <button
          type="button"
          onClick={() => this.props.handleLogIn(this.state.privateKey)}
        >
          Log in
        </button>
        <h3> Create Account </h3>
        <input
          type="text"
          placeholder="New Private Key"
          value={this.state.privateKey}
        />
        <button
          type="button"
          onClick={() => {
            const { privateKey, publicKey } = createKeys();
            this.setState({ privateKey });
            this.props.createAccount(privateKey);
            alert("Save the key in the field, it is your only way to sign in");
          }}
        >
          Generate New Private Key
        </button>
      </div>
    );
  }
}
export default SignIn;
