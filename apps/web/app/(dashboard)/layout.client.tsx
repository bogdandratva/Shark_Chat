"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { useMemo, useState } from "react";
import { trpc } from "@/utils/trpc";
import { getBaseUrl } from "@/utils/get-base-url";
import { showToast } from "@/utils/stores/page";
import { AblyClientProvider } from "@/utils/ably/client";
import { PrivateEventManager } from "@/utils/handlers/private";
import { GroupEventManager } from "@/utils/handlers/group";
import { MessageEventManager } from "@/utils/handlers/chat";
import { SessionProvider } from "@/utils/auth";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <SessionProvider>
        <AblyClientProvider>
          <PrivateEventManager />
          <GroupEventManager />
          <MessageEventManager />
          {children}
        </AblyClientProvider>
      </SessionProvider>
    </ClientProvider>
  );
}

function ClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            retryOnMount: false,
          },
          mutations: {
            retry: false,
            onError(error) {
              if (error instanceof TRPCClientError) {
                showToast({
                  title: "Unknown Error",
                  description: error.message,
                });
              }
            },
          },
        },
      }),
  );
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
          }),
        ],
      }),
    [],
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
