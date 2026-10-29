import React from "react";
import { Building } from "lucide-react";

// Fill in per project.
const Impressum: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Imprint</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: [date]</p>
      </header>
      <div className="prose prose-lg max-w-none text-foreground">
        <h2>Provider</h2>
        <p>
          [Organisation name]
          <br />
          [Street and number]
          <br />
          [Postcode and city], [Country]
        </p>
        <h2>Contact</h2>
        <p>
          Phone: [phone number]
          <br />
          Email: [email address]
        </p>
        <h2>Represented by</h2>
        <p>[Name and role of the legal representative]</p>
        <h2>Responsible for content</h2>
        <p>[Name and address of the person responsible for the content]</p>
        <h2>Liability for content and links</h2>
        <p>
          [Liability notice for the content of this site and for external links, as required in the
          provider's country.]
        </p>
      </div>
    </div>
  );
};

export default Impressum;
