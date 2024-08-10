const functions = require("firebase-functions");
const cors = require("cors")({origin: true});

// It's better to use environment variables for API keys
const stripeApiKey = functions.config().stripe.secret_key;
const stripe = require("stripe")(stripeApiKey);

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({error: "Method not allowed"});
    }

    try {
      const {jobId, amount, currency, userId} = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency || "usd",
              product_data: {
                name: "Job Posting Fee",
                description: `Job ID: ${jobId}`,
              },
              unit_amount: amount || 2000,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://codeplace.co/success", // Add a success page
        cancel_url: "https://codeplace.co/cancel", // Add a cancel page
        client_reference_id: jobId,
        customer_email: userId, // Assuming userId
      });

      return res.json({id: session.id});
    } catch (error) {
      console.error("Error creating checkout session:", error.message);
      return res.status(500).send({error: error.message});
    }
  });
});
