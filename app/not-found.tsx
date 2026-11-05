import { FileQuestion } from "lucide-react";

import { StatusPage } from "@/components/shared";

const NotFound = () => {
  return (
    <StatusPage
      icon={FileQuestion}
      title="Page not found"
      description="That route does not exist or may have moved. Head back to your archive or the home page."
      primaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Back to home", href: "/" }}
    />
  );
};

export default NotFound;
