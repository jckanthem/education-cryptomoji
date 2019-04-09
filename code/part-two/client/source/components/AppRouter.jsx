import React from "react";
import SignIn from "./SignIn.jsx";
import {
  fetchState,
  fetchStatePartial,
  sendBatch
} from "../services/apiRoutes.js";
import { encodeAll } from "../services/transactions.js";
import { createKeys, getPublicKey } from "../services/signing.js";
import {
  getCollectionAddress,
  getMojiAddress,
  getSireAddress
} from "../services/addressing";
import { encode } from "punycode";
//USE LOCALHOST 3000 WITH DOCKER-COMPOSE UP RUNNING
class AppRouter extends React.Component {
  constructor(props) {
    super();
    this.state = {
      user: null, //private key
      page: "home"
    };
    this.updatePage = this.updatePage.bind(this);
  }
  handleSubmit(privateKey) {
    console.log(privateKey);
    let keys = createKeys();
    privateKey = keys.privateKey;
    let publicKey = getPublicKey(privateKey);
    let collectionAddress = getCollectionAddress(publicKey);
    fetchState(collectionAddress).then(data => {
      if (data.error) {
        alert("Invalid private key, please register");
      }
    });
    // .catch(err => {
    //
    // });
  }
  updatePage(page) {
    this.setState({ page });
  }
  renderPage() {
    switch (this.state.page) {
      case "home": {
        return null;
      }
      case "profile": {
      }
      case "signIn": {
        return <SignIn handleSubmit={this.handleSubmit.bind(this)} />;
      }
    }
  }
  render() {
    return (
      <div>
        <nav id="navBar">
          <ul>
            <li>
              <div
                className="redirectLink"
                id="home"
                onClick={() => this.updatePage("home")}
              >
                Home
              </div>
            </li>
            <li>
              <div
                className="redirectLink"
                id="profile"
                onClick={() => this.updatePage("profile")}
              >
                Profile
              </div>
            </li>
            <li>
              <div
                className="redirectLink"
                id="signIn"
                onClick={() => this.updatePage("signIn")}
              >
                Sign In
              </div>
            </li>
          </ul>
        </nav>
        {this.renderPage()}
      </div>
    );
  }
}

export default AppRouter;
