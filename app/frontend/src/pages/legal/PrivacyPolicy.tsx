import React from "react";
import { Shield } from "lucide-react";

// Fill in per project.
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: [date]</p>
      </header>
      <div className="prose prose-lg max-w-none text-foreground">
        <h2>1. Data controller</h2>
        <p>
          [Organisation name], [address]. Email: [email address].
        </p>
        <h2>2. Data protection officer</h2>
        <p>[Name and contact details of the data protection officer]</p>
        <h2>3. Data we process</h2>
        <p>
          When you create an account we store your name and email address. When you use the
          application we store the models, workspaces and settings you create, and technical log
          data needed to run the service.
        </p>
        <h2>4. Purpose and legal basis</h2>
        <p>[Purposes of processing and the legal basis under the GDPR]</p>
        <h2>5. Storage period</h2>
        <p>[How long each type of data is kept]</p>
        <h2>6. Recipients and hosting</h2>
        <p>[Hosting provider, processors and any third-party services, such as map tiles]</p>
        <h2>7. Cookies and local storage</h2>
        <p>[Cookies and browser storage used by the application]</p>
        <h2>8. Your rights</h2>
        <p>
          You have the right to access, rectify, erase and restrict the processing of your data, to
          data portability and to object to processing. You can withdraw consent at any time and
          lodge a complaint with a supervisory authority. Contact: [email address].
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
