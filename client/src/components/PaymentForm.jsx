import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Payment form component
const StripePaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
    } else {
      console.log('PaymentMethod:', paymentMethod);
      // Send paymentMethod.id to backend to complete payment
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <CardElement className="p-3 border rounded-md mb-4" />
      <button
        type="submit"
        disabled={!stripe}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
      >
        Pay
      </button>
    </form>
  );
};

export default StripePaymentForm;
