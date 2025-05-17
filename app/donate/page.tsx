import type { Metadata } from "next";
import { JSX } from "react";

import Link from "next/link";

export const metadata: Metadata = {
  title: "Home | Next.js + TypeScript Example",
};

export default function IndexPage(): JSX.Element {
  return (
    <ul className="card-list">
   
      <li>
        <Link
          href="/donate-with-elements"
          className="card elements-style-background"
        >
          <h2 className="bottom">Donate with Elements</h2>
          <img src="/elements-card-payment.svg" />
        </Link>
      </li>
    </ul>
  );
}
