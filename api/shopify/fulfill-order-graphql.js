// Fulfill Order using GraphQL API (more reliable)
export const config = { runtime: "nodejs" };

export async function fulfillOrderGraphQL(shopUrl, accessToken, orderId, trackingNumber = null, trackingUrl = null) {
  try {
    console.log('🔄 Fulfilling order with GraphQL:', orderId);

    // Step 1: Get fulfillment orders first
    const queryFulfillmentOrders = `
      query getFulfillmentOrders($orderId: ID!) {
        order(id: $orderId) {
          fulfillmentOrders(first: 1) {
            edges {
              node {
                id
                status
              }
            }
          }
        }
      }
    `;

    const queryResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: queryFulfillmentOrders, 
          variables: { orderId: `gid://shopify/Order/${orderId}` }
        })
      }
    );

    const queryData = await queryResponse.json();
    
    if (queryData.errors) {
      console.error('❌ Error getting fulfillment orders:', queryData.errors);
      return { success: false, errors: queryData.errors };
    }

    const fulfillmentOrderId = queryData.data?.order?.fulfillmentOrders?.edges?.[0]?.node?.id;
    
    if (!fulfillmentOrderId) {
      console.error('❌ No fulfillment order found');
      return { success: false, error: 'No fulfillment order found' };
    }

    console.log('✅ Found fulfillment order:', fulfillmentOrderId);

    // Step 2: Create fulfillment
    const mutation = `
      mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
        fulfillmentCreateV2(fulfillment: $fulfillment) {
          fulfillment {
            id
            status
            trackingInfo {
              number
              company
              url
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const trackingInfo = {
      company: "WhatsApp CRM",
      number: trackingNumber || `WA-${Date.now()}`
    };

    if (trackingUrl) {
      trackingInfo.url = trackingUrl;
    }

    const variables = {
      fulfillment: {
        lineItemsByFulfillmentOrder: [{
          fulfillmentOrderId: fulfillmentOrderId
        }],
        trackingInfo,
        notifyCustomer: false
      }
    };

    const response = await fetch(
      `https://${shopUrl}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: mutation, variables })
      }
    );

    const data = await response.json();

    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return { success: false, errors: data.errors };
    }

    if (data.data?.fulfillmentCreateV2?.userErrors?.length > 0) {
      console.error('❌ User errors:', data.data.fulfillmentCreateV2.userErrors);
      return { 
        success: false, 
        errors: data.data.fulfillmentCreateV2.userErrors 
      };
    }

    console.log('✅ GraphQL fulfillment success!');
    return { 
      success: true, 
      data: data.data.fulfillmentCreateV2.fulfillment 
    };

  } catch (error) {
    console.error('❌ GraphQL fulfillment error:', error);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  return res.status(200).json({
    message: 'This endpoint is called internally'
  });
}
