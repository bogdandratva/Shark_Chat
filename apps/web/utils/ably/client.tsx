import { useSession } from "@/utils/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { getBaseUrl } from "@/utils/get-base-url";
import type { Realtime } from "ably";

const Context = createContext<Realtime | undefined>(undefined);

export function useAbly(): Realtime | undefined {
  return useContext(Context);
}

export function AblyClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ably, setAbly] = useState<Realtime>();
  const { status } = useSession();
  useEffect(() => {
    import("ably").then((res) => {
      const instance = new res.Realtime({
        authUrl: `${getBaseUrl()}/api/ably/auth`,
        authMethod: "POST",
        autoConnect: false,
      });
      instance.connection.on("connected", () =>
        console.log("Ably Client connected"),
      );
      instance.connection.on("closed", () =>
        console.log("Ably Client disconnected"),
      );

      setAbly(instance);
    });
  }, []);

  useEffect(() => {
    if (!ably) return;
    const connected = ably.connection.state === "connected";

    if (!connected && status === "authenticated") {
      ably.connect();
    }

    if (connected && status === "unauthenticated") {
      ably.close();
    }
  }, [ably, status]);

  return <Context.Provider value={ably}>{children}</Context.Provider>;
}
