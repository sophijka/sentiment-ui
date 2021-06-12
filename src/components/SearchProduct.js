import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Component } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

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
import {CSVLink, CSVDownload} from 'react-csv';

import buildRequest from "../buildRequestSingleCAO";
import aggregateRequest from "../aggregateRequest";
import runRequest from "../runRequest";
import applyDisjunctiveFaceting from "../applyDisjunctiveFaceting";
import buildState from "../buildState";

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
      {/* &#x25bc; */}
    </a>
  ));
  
  // forwardRef again here!
  // Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
      const [value, setValue] = useState('');
      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <FormControl
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          <ul className="list-unstyled">
            {React.Children.toArray(children).filter(
              (child) =>
                !value || child.props.children.toLowerCase().startsWith(value),
            )
            }
          </ul>
        </div>
      );
    },
  );

export default class SearchCAO extends Component {

    constructor(props) {
        super(props);
        this.state = {cao_list: [],
                      cao_selected: "",
                      results: [],
            config:{debug: true,
            hasA11yNotifications: true,

            // commented out on 23.12
            onSearch: async search_state => {
              const { resultsPerPage } = search_state;
          
              search_state = {
                  ...search_state,
                  cao: this.state.cao_selected,
              };
          
              const requestBody = buildRequest(search_state);
              const responseJson = await runRequest(requestBody);

              var exportResult = []
              for (var i=0; i < responseJson.hits.hits.length; i++){
                var temp = {}
                for(var key in responseJson.hits.hits[i]) {
                  var value = responseJson.hits.hits[i][key];
                  if (key == "_source"){
                    for (var skey in value){
                      temp[skey] = value[skey];
                    }
                  }
                  else if (key == "_score"){
                    temp["score"] = value;
                  }
                }
                temp["query"] = search_state["searchTerm"];
                exportResult.push(temp);
              }
              this.setState({results : exportResult});
              return buildState(responseJson, resultsPerPage);
            }
          }
        }
    };

    getAggregates = async () => {
        const requestBody = aggregateRequest(this.state);
        const responseJson = await runRequest(requestBody);
        console.log(responseJson["aggregations"]["name"]["buckets"]);
        const cao_list = responseJson["aggregations"]["name"]["buckets"];
        
        var companies = [];
        for (var i = 0; i < cao_list.length; i++ ) {
          companies.push(cao_list[i].key);
        }
    
        this.setState({cao_list: companies});
        console.log(this.state.cao_list);
      };

    handleSelect = (e) => {
      this.setState({cao_selected : this.state.cao_list[e]});
    };

    
    // fetchData = () => {
    //   this.csvLink.current.link.click()
    // }

    componentDidMount = () => {
        this.getAggregates();
    };

  render(){

    const items = []
    for (const [index, value] of this.state.cao_list.entries()) {
      items.push(<Dropdown.Item eventKey={index}>{value}</Dropdown.Item>)
    }
 
    return(
      <Container>
      <Row xs={1} md={1}>
      <Col>
      {/* <CardDeck> */}
        <Card border="light">
          <Card.Body>
            <Dropdown as={ButtonGroup} onSelect={this.handleSelect}>
              <Dropdown.Toggle as={CustomToggle}  variant="success" id="dropdown-custom-components">
                Select a CAO 
              </Dropdown.Toggle>
              <Dropdown.Menu as={CustomMenu} className="super-colors" style={{color:'black'}}>
                {items}
              </Dropdown.Menu>
            </Dropdown>
            <div>
              [ selected {this.state.cao_selected != ""
                ? this.state.cao_selected
                : "none yet "
                }
              ]
            </div>
          </Card.Body>
        </Card>
        </Col>
        <Col>
        <Card>
        <Card.Body>
          <SearchProvider config={this.state.config}>
            <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
              {({ wasSearched }) => (
                <div className="SearchCAO">
                  <ErrorBoundary>
                  <Layout
                    header={
                      <SearchBox
                    //     autocompleteMinimumCharacters={3}
                    //     autocompleteResults={{
                    //     linkTarget: "_blank",
                    //     sectionTitle: "Results",
                    //     titleField: "name",
                    //     shouldTrackClickThrough: true,
                    //     clickThroughTags: ["test"]
                    //   }}
                    // autocompleteSuggestions={true}
                  />
              }
                bodyContent={
                  <Results
                    titleField="name.buckets.key"
                    shouldTrackClickThrough={true}
                  />
                }
                
                bodyHeader={
                  <React.Fragment>
                    {wasSearched && <PagingInfo />}
                    {wasSearched && <ResultsPerPage />}
                  </React.Fragment>
                }
                bodyFooter={<Paging />}
                sideContent={
                  <div>
                      <CSVLink
                          data={this.state.results}
                          filename='export.csv'
                          // className="hidden"
                          // ref={this.csvLink}
                          target="_blank" 
                      >
                        Download data
                      </CSVLink>
                      {/* <Button variant="dark">Data export</Button> */}
                  </div>
                }
              />
            </ErrorBoundary>
          </div>
        )}
      </WithSearch>
    </SearchProvider>
    </Card.Body>
      </Card>
      {/* </CardDeck> */}
      </Col>
      </Row>
      </Container>
  );
}
};
