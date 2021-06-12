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

function buildMatch(searchTerm) {
  return searchTerm
    ? {
        multi_match: {
          query: searchTerm,
          fields: ["text"]
          // analyzer: "synonym"
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
  const {
    current,
    filters,
    resultsPerPage,
    searchTerm,
    sortDirection,
    sortField
  } = state;

  const sort = buildSort(sortDirection, sortField);
  const match = buildMatch(searchTerm);
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
    // _source: ["id", "text", "name", "sector"],
    _source: ["id", "text", "stars", "language", "sentiment", "stars", "review_title", "original_text"],
    aggs: {
      language: { terms: { field: "language", size: 100 } },
      stars: { terms: { field: "stars", size: 100 } },
      product_commodity: { terms: { field: "product_commodity", size: 100 } },
      artifact_instrument: { terms: { field: "artifact_instrument", size: 100 } },

      object_food: { terms: { field: "object_food", size: 100 } },
      food_beverage: { terms: { field: "food_beverage", size: 100 } },
      sentiment: {
        range: {
          field: "sentiment",
          ranges: [
            { from: 0.01, to: 100.0, key: "0 - 100" },
            { from: 0.0, to: 0.0001, key: "0 - 0.0001" },
            { from: -100, to: -0.0001, key: "-100 - -0.0001" },
            { from: 100.0, key: "100+" }
          ]
        }
      }
    },
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
