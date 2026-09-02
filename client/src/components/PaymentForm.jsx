import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// const StripePaymentForm = ({ onPaymentMethodGenerated }) => {
const StripePaymentForm = ({ amount, onPaymentConfirmed }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || processing) return;
    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      // Card details invalid / incomplete — tell the user instead of failing silently.
      if (error) {
        toast.error(error.message || 'Please check your card details and try again.');
        return;
      }

      // Create the PaymentIntent on the server (fails here if Stripe keys are missing/invalid).
      let clientSecret;
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/payments/intents`, { amount });
        clientSecret = res.data.clientSecret;
      } catch (intentErr) {
        console.error(intentErr);
        toast.error(intentErr?.response?.data?.error || 'Unable to start payment. Please try again later.');
        return;
      }
      if (!clientSecret) {
        toast.error('Unable to start payment. Please try again later.');
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });
      if (confirmError) {
        toast.error(confirmError.message || 'Payment could not be completed.');
        return;
      }
      if (paymentIntent?.next_action?.redirect_to_url?.url) {
        window.location.assign(paymentIntent.next_action.redirect_to_url.url);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        onPaymentConfirmed(paymentIntent.id);
      } else {
        toast.error(`Payment ${paymentIntent?.status || 'was not completed'}. Please try again.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong processing the payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    // <form onSubmit={handlePayment}>
      <div className='flex w-full '>
        <CardElement className="py-4 px-3 border rounded-md w-full"
         options={{
          hidePostalCode: true,
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              '::placeholder': {
                color: '#a0aec0',
              },
            },
            invalid: {
              color: '#fa755a',
            },
          },
        }}/>
        <button
          type="submit"
          onClick={handlePayment}
          disabled={!stripe || processing}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition ml-1 disabled:opacity-60"
        >
          {processing ? 'Processing…' : 'Pay'}
        </button>
        {/* </form> */}
      </div>
  );
};

const GooglePayButton = () => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: { label: 'Total', amount: 1000 },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then(result => {
        if (result) setPaymentRequest(pr);
      });
    }
  }, [stripe]);

  return paymentRequest ? (
    <PaymentRequestButtonElement options={{ paymentRequest }} />
  ) : (
    <p>Google Pay not available</p>
  );
};

// const PayPalComponent = () => {
//   return (
//     <PayPalScriptProvider options={{ "client-id": "test", currency: "USD" }}>
//       <PayPalButtons
//         style={{ layout: 'vertical' }}
//         createOrder={(data, actions) => {
//           return actions.order.create({
//             purchase_units: [{ amount: { value: '1.00' } }],
//           });
//         }}
//         onApprove={(data, actions) => {
//           return actions.order.capture().then(details => {
//             alert(`Transaction completed by ${details.payer.name.given_name}`);
//           });
//         }}
//       />
//     </PayPalScriptProvider>
//   );
// };
// PayPalComponent
export { StripePaymentForm, GooglePayButton,};
