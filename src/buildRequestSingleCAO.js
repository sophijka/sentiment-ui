import buildRequestFilter from "./buildRequestFilter";

function buildFrom(current, resultsPerPage) {
  if (!current || !resultsPerPage) return;
  return (current - 1) * resultsPerPage;
}

function buildSort(sortDirection, sortField) {
  if (sortDirection && sortField) {
    return [{ [`${sortField}`]: sortDirection }];
  }
}

function buildMatch(searchTerm, cao) {
  console.log(cao);
  return searchTerm
   ? { bool : {
        must : [ {
          match : {
            text : {
              query: searchTerm,
              analyzer: "synonym"
            }
          }
        }, {
          terms : {
            name : [ cao ]
          }
        } ]
      }
    }
    : { match_all: {} };

}

/*

  Converts current application state to an Elasticsearch request.

  When implementing an onSearch Handler in Search UI, the handler needs to take the
  current state of the application and convert it to an API request.

  For instance, there is a "current" property in the application state that you receive
  in this handler. The "current" property represents the current page in pagination. This
  method converts our "current" property to Elasticsearch's "from" parameter.

  This "current" property is a "page" offset, while Elasticsearch's "from" parameter
  is a "item" offset. In other words, for a set of 100 results and a page size
  of 10, if our "current" value is "4", then the equivalent Elasticsearch "from" value
  would be "40". This method does that conversion.

  We then do similar things for searchTerm, filters, sort, etc.
*/
export default function buildRequest(state) {

  console.log(state);
  const {
    current,
    filters,
    resultsPerPage,
    searchTerm,
    sortDirection,
    sortField,
    cao
  } = state;

  const sort = buildSort(sortDirection, sortField);
  const match = buildMatch(searchTerm, cao);
  const size = resultsPerPage;
  const from = buildFrom(current, resultsPerPage);
  const filter = buildRequestFilter(filters);

  const body = {
    // Static query Configuration
    // --------------------------
    // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-highlighting.html
    highlight: {
      fragment_size: 1500,
      number_of_fragments: 1,
      fields: {
        text: {}
      }
    },
    //https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-source-filtering.html#search-request-source-filtering
    // _source: ["id", "nps_link", "title", "description", "employees_count"],
    _source: ["id", "text", "name", "sector", "file"],

    // // Dynamic values based on current Search UI state
    // // --------------------------
    // // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/full-text-queries.html
    query: {
      bool: {
        must: [match],
        ...(filter && { filter })
      },
    },
    // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-sort.html
    ...(sort && { sort }),
    // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-from-size.html
    ...(size && { size }),
    ...(from && { from })
  };

  return body;
}
