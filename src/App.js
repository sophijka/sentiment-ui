import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout, SingleSelectFacet } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import './index.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from "react-router-bootstrap";

import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  WithSearch,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting
} from "@elastic/react-search-ui";



import buildRequest from "./buildRequest";
import runRequest from "./runRequest";
import applyDisjunctiveFaceting from "./applyDisjunctiveFaceting";
import buildState from "./buildState";


library.add(faEdit);

const config = {
  debug: true,
  hasA11yNotifications: true,
  onResultClick: () => {
    /* Not implemented */
  },
  onAutocompleteResultClick: () => {
    /* Not implemented */
  },
  onAutocomplete: async ({ searchTerm }) => {
    const requestBody = buildRequest({ searchTerm });
    const json = await runRequest(requestBody);
    const state = buildState(json);
    return {
      autocompletedResults: state.results
    };
  },
  onSearch: async state => {
    const { resultsPerPage } = state;
    const requestBody = buildRequest(state);
    // Note that this could be optimized by running all of these requests
    // at the same time. Kept simple here for clarity.
    const responseJson = await runRequest(requestBody);
    const responseJsonWithDisjunctiveFacetCounts = await applyDisjunctiveFaceting(
      responseJson,
      state,
      ["product_commodity", "artifact_instrument"]
    );
    // return buildState(responseJson, resultsPerPage);
    return buildState(responseJsonWithDisjunctiveFacetCounts, resultsPerPage);
  }
};

class App extends Component {
  render() {
  return (
    <div className="App">
        <Router>
          <div>
          
            <Navbar expand="lg" bg="dark" variant="dark">
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                 <Nav className="mr-auto">
                 <Nav.Link>Search and sentiment analysis of reviews</Nav.Link>
                 </Nav>
               </Navbar.Collapse>
             </Navbar>
           </div>
         </Router>

    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => (
          <div className="SearchAll">
            <ErrorBoundary>
              <Layout
                header={
                  <SearchBox
                    autocompleteMinimumCharacters={3}
                    autocompleteResults={{
                      linkTarget: "_blank",
                      sectionTitle: "Results",
                      titleField: "text",
                      shouldTrackClickThrough: true,
                      clickThroughTags: ["test"]
                    }}
                    autocompleteSuggestions={true}
                  />
                }
                sideContent={
                  <div>
                    {wasSearched 
                    && (
                      <Sorting
                      label={"Sort by"}
                      sortOptions={[
                        {
                          name: "Relevance",
                          value: "",
                          direction: ""
                        },
                        {
                          name: "Stars",
                          value: "stars",
                          direction: "desc"
                        }
                      ]}
                    />
                    )
                    }
                    <Facet field="language" label="Language" filterType="any" 
                    />
                    <Facet field="stars" label="stars" filterType="any" />
                    <Facet
                      field="product_commodity"
                      label="Product"
                      filterType="any"
                      // view={SingleSelectFacet}
                      isFilterable={true}
                    />
                    <Facet
                      field="artifact_instrument"
                      label="Instrument"
                      filterType="any"
                      // view={SingleSelectFacet}
                      isFilterable={true}
                    />
                    <Facet
                      field="object_food"
                      label="Food"
                      filterType="any"
                      // view={SingleSelectFacet}
                      isFilterable={true}
                    />
                    <Facet
                      field="food_beverage"
                      label="Beverage"
                      filterType="any"
                      // view={SingleSelectFacet}
                      isFilterable={true}
                    />
                    <Facet field="sentiment" label="Overall sentiment" filterType="any" />
                  </div>
                }
                bodyContent={
                  <Results
                    titleField="review_title"
                    shouldTrackClickThrough={true}
                  />
                }
                bodyHeader={
                  <React.Fragment>
                    {wasSearched && <PagingInfo   />}
                    {wasSearched && <ResultsPerPage />}
                  </React.Fragment>
                }
                bodyFooter={<Paging />}
              />
            </ErrorBoundary>
          </div>
        )}
      </WithSearch>
    </SearchProvider>
  
  </div>
  )
}
}

export default App;