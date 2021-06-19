import React, { Component } from "react";
import SearchAll from './components/SearchAll';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './index.css';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from "react-router-bootstrap";

import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

library.add(faEdit);

class App extends Component {
  
  constructor(props) {
    super(props);
  };


  render() {
    return (
      <div className="App">
        <Router>
          <div>
          
            <Navbar expand="lg" bg="dark" variant="dark">
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                <LinkContainer to="/search">
                <Nav.Link>Search and sentiment analysis, powered by Expert.ai and Elastic</Nav.Link>
                </LinkContainer>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
            <Switch>
              <Route exact path="/search" render={(props) => <SearchAll {...props}/>} />
            </Switch>
            
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
