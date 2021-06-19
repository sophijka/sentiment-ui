import React from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

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
import { Layout, SingleSelectFacet } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

import buildRequest from "../buildRequest";
import runRequest from "../runRequest";
import applyDisjunctiveFaceting from "../applyDisjunctiveFaceting";
import buildState from "../buildState";

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

export default function SearchAll() {
  return (
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
                      view={SingleSelectFacet}
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
                    {wasSearched && <PagingInfo   
  //                   view={({ start, end }) => (
  //   <div className="paging-info">
  //     <strong>
  //       {start} - {end}
  //     </strong>
  //   </div>
  // )}
  />}
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
  );
}
