// File: src/modules/client/checkout/components/CheckoutLeftForm.jsx
import React from 'react';
import CheckoutAddress from './CheckoutAddress';
import CheckoutShipping from './CheckoutShipping';
import CheckoutPayment from './CheckoutPayment';
import CheckoutVat from './CheckoutVat';

export default function CheckoutLeftForm({
  address, setAddress,
  cities, districts, wards,
  note, setNote,
  loadingDistricts, loadingWards,
  shippingOptions, selectedShipping, setSelectedShipping, isCalculatingShip,
  paymentMethod, setPaymentMethod,
  vatInfo, setVatInfo 
}) {
  
  return (
    <div className="flex flex-col gap-6">
      <CheckoutAddress 
        address={address} setAddress={setAddress}
        cities={cities} districts={districts} wards={wards}
        loadingDistricts={loadingDistricts} loadingWards={loadingWards}
        note={note}         
        setNote={setNote}   
      />
      
      <CheckoutShipping 
        address={address} 
        shippingOptions={shippingOptions} 
        selectedShipping={selectedShipping} 
        setSelectedShipping={setSelectedShipping} 
        isCalculatingShip={isCalculatingShip}
      />

      <CheckoutPayment 
        paymentMethod={paymentMethod} 
        setPaymentMethod={setPaymentMethod} 
      />

      <CheckoutVat 
        vatInfo={vatInfo} 
        setVatInfo={setVatInfo} 
      />
    </div>
  );
}