"use client";

import { useEffect } from "react";
import { CopilotKit } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const removeInspector = () => {
      document.querySelectorAll("cpk-web-inspector").forEach((node) => node.remove());
    };

    removeInspector();

    const observer = new MutationObserver(removeInspector);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false} useSingleEndpoint>
      {children}
    </CopilotKit>
  );
}
