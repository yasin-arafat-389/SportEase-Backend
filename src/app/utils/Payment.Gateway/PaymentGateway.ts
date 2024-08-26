/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from '../../config';

export const initiatePayment = async (paymentData: any) => {
  try {
    const response = await axios.post(config.payment_url as string, {
      store_id: config.store_id,
      signature_key: config.signature_key,
      tran_id: paymentData.transactionId,
      success_url: `http://localhost:5000/api/confirmation?transactionId=${paymentData.transactionId}&status=success`,
      fail_url: `http://localhost:5000/api/confirmation?status=failed`,
      cancel_url: 'http://localhost:5173/',
      amount: paymentData.totalPrice,
      currency: 'BDT',
      desc: 'Facility Booking Payment',
      cus_name: paymentData.custormerName,
      cus_email: paymentData.customerEmail,
      cus_add1: paymentData.customerAddress,
      cus_add2: 'N/A',
      cus_city: 'N/A',
      cus_state: 'N/A',
      cus_postcode: 'N/A',
      cus_country: 'N/A',
      cus_phone: paymentData.customerPhone,
      type: 'json',
    });

    return response.data;
  } catch (err) {
    throw new Error('Payment initialization failed!');
  }
};

export const verifyPayment = async (tnxId: string) => {
  try {
    const response = await axios.get(
      config.payment_verification_url as string,
      {
        params: {
          store_id: config.store_id,
          signature_key: config.signature_key,
          type: 'json',
          request_id: tnxId,
        },
      },
    );

    return response.data;
  } catch (err) {
    throw new Error('Payment validation failed!');
  }
};
