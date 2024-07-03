const functions = require("firebase-functions");
const cors = require("cors")({origin: true});

const stripeApiKey =
"sk_test_51PVdEj02Xwjq9MLsuau7pVe2I4gODVGByatywiOV"+
"fwA7tQPfER4L7MmnM82OVHadyL3u7t97LxIuJa8ExXBEXGyc00gv875ScV";

const stripe = require("stripe")(stripeApiKey);

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  if (req.method === "OPTIONS") {
    // Handle CORS preflight request
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.set("Access-Control-Allow-Origin", "*"); // Allow CORS
      res.status(405).send({error: "Method not allowed"});
      return;
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Job Posting Fee",
              },
              unit_amount: 2000, // Replace with actual amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://codeplace.co", // Replace with your success URL
        cancel_url: "https://codeplace.co", // Replace with your cancel URL
      });

      res.set("Access-Control-Allow-Origin", "*"); // Allow CORS
      res.json({id: session.id});
    } catch (error) {
      console.error("Error creating checkout session:", error.message);
      res.set("Access-Control-Allow-Origin", "*"); // Allow CORS
      res.status(500).send({error: error.message});
    }
  });
});
