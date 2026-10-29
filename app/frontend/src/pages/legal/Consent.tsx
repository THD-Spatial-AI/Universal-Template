import React from "react";
import { CheckCircle } from "lucide-react";

// Fill in per project.
const Consent: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Declaration of Consent</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: [date]</p>
      </header>
      <div className="prose prose-lg max-w-none text-foreground">
        <p>
          By creating a user account, I consent to the storage and processing of my name and email
          address, which are needed to create the account and to contact me about my use of the
          application.
        </p>
        <p>
          I understand that any data I provide for creating models will be used only to run the
          simulations, and not analysed, shared or used for other purposes.
        </p>
        <p>
          My consent is voluntary, and I can withdraw it at any time by contacting [team or
          organisation] at [email address]. My personal data will then be deleted without undue
          delay; processing before the withdrawal remains lawful.
        </p>
        <p>The data controller is [organisation name], [address].</p>
        <p>
          I have the right to access my personal data and to request its correction or deletion
          under the GDPR. Details are given in the{" "}
          <a href="/privacy" target="_blank">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Consent;
