import { WifiOff } from "lucide-react";

import { StatusPage } from "@/components/shared";

const OfflinePage = () => {
  return (
    <StatusPage
      icon={WifiOff}
      title="You are offline"
      description="Chat and uploads need an internet connection. Reconnect and try again."
      primaryAction={{
        label: "Back to dashboard",
        href: "/dashboard",
      }}
    />
  );
};

export default OfflinePage;
