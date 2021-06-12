function getValueFacet(aggregations, fieldName) {
  if (
    aggregations &&
    aggregations[fieldName] &&
    aggregations[fieldName].buckets &&
    aggregations[fieldName].buckets.length > 0
  ) {
    return [
      {
        field: fieldName,
        type: "value",
        data: aggregations[fieldName].buckets.map(bucket => ({
          // Boolean values and date values require using `key_as_string`
          value: bucket.key_as_string || bucket.key,
          count: bucket.doc_count
        }))
      }
    ];
  }
}

function getRangeFacet(aggregations, fieldName) {
  console.log("RangeFacet");
  if (
    aggregations &&
    aggregations[fieldName] &&
    aggregations[fieldName].buckets &&
    aggregations[fieldName].buckets.length > 0
  ) {
    return [
      {
        field: fieldName,
        type: "range",
        data: aggregations[fieldName].buckets.map(bucket => ({
          // Boolean values and date values require using `key_as_string`
          value: {
            to: bucket.to,
            from: bucket.from,
            name: bucket.key
          },
          count: bucket.doc_count
        }))
      }
    ];
  }
}

export default function buildStateFacets(aggregations) {
  const product_commodity = getValueFacet(aggregations, "product_commodity");
  const artifact_instrument = getValueFacet(aggregations, "artifact_instrument");
  const object_food = getValueFacet(aggregations, "object_food");
  const sentiment = getRangeFacet(aggregations, "sentiment");
  const food_beverage = getValueFacet(aggregations, "food_beverage"); 
  const language = getValueFacet(aggregations, "language"); 
  const stars = getValueFacet(aggregations, "stars"); 

  console.log(sentiment);
  const facets = {
    ...(product_commodity && { product_commodity }),
    ...(artifact_instrument && { artifact_instrument }),
    ...(object_food && { object_food }),
    ...(sentiment && { sentiment }),
    ...(food_beverage && { food_beverage }),
    ...(language && { language }),
    ...(stars && { stars })
  };

  if (Object.keys(facets).length > 0) {
    return facets;
  }
}
