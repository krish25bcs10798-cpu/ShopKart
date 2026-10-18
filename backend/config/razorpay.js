import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const merchantIdentifier = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const merchantSecretKey = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

/**
 * Razorpay Gateway Client Instance
 */
export const razorpayGatewayClient = new Razorpay({
  key_id: merchantIdentifier,
  key_secret: merchantSecretKey,
});

export default razorpayGatewayClient;
