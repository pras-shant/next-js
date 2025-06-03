import type { Metadata } from "next";

import ElementsForm from "../components/ElementsForm";
import { JSX } from "react";

export const metadata: Metadata = {
  title: "Donate with Elements",
};

export default function PaymentElementPage({
  searchParams,
}: {
  searchParams?: { payment_intent_client_secret?: string };
}): JSX.Element {
  return (
    <div className="page-container">
      <h1>Stripe Payment</h1>
      <ElementsForm />
    </div>
  );
}
