import { useMessageStore } from "@/utils/stores/chat";
import { trpc } from "@/utils/trpc";
import { getMessageVariables } from "@/utils/variables";
import { useSession } from "next-auth/react";
import { Fragment, ReactNode, useLayoutEffect, useMemo } from "react";
import { Button } from "ui/components/button";
import { useChatView } from "./ChatView";
import { ChatMessageItem } from "./message";
import { LocalMessageItem } from "./message/sending";
import { setChannelUnread } from "@/utils/handlers/realtime/shared";
import { usePathname } from "next/navigation";

export function MessageList({
  channelId,
  welcome,
}: {
  channelId: string;
  welcome: ReactNode;
}) {
  const pathname = usePathname();
  const { status } = useSession();
  const variables = getMessageVariables(channelId);
  const lastRead = useLastRead(channelId);
  const [sending] = useMessageStore((s) => [s.sending[channelId]]);

  const query = trpc.chat.messages.useInfiniteQuery(variables, {
    enabled: status === "authenticated",
    staleTime: Infinity,
    getPreviousPageParam: (messages) =>
      messages.length >= variables.count
        ? messages[messages.length - 1].timestamp
        : null,
  });

  const rows = useMemo(
    () =>
      query.data?.pages?.flatMap((messages) => [...messages].reverse()) ?? [],
    [query.data?.pages],
  );

  const showSkeleton = query.isLoading || query.hasPreviousPage;

  const { sentryRef, resetScroll, updateScrollPosition } = useChatView({
    hasNextPage: (query.hasPreviousPage ?? true) || rows.length === 0,
    onLoadMore: () => {
      if (!query.isSuccess || query.isFetchingPreviousPage) return;

      if (query.hasPreviousPage) {
        void query.fetchPreviousPage();
      }
    },
    disabled: query.isLoading,
    loading: query.isFetchingPreviousPage,
  });

  useLayoutEffect(() => {
    resetScroll();
  }, [resetScroll, pathname]);

  useLayoutEffect(() => {
    updateScrollPosition();
  }, [rows, sending, updateScrollPosition]);

  return (
    <div className="flex flex-col gap-3 mb-8">
      {showSkeleton ? (
        <div ref={sentryRef} className="flex flex-col gap-3">
          {new Array(40).fill(0).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <>
          <p>{query.error.message}</p>
          <Button color="danger" onClick={() => query.refetch()}>
            Retry
          </Button>
        </>
      ) : (
        welcome
      )}
      {rows.map((message, i, arr) => {
        const prev_message = i > 0 ? arr[i - 1] : null;
        const newLine =
          lastRead != null &&
          lastRead < new Date(message.timestamp) &&
          (prev_message == null ||
            new Date(prev_message.timestamp) <= lastRead);

        return (
          <Fragment key={message.id}>
            {newLine && <UnreadSeparator />}
            <ChatMessageItem message={message} />
          </Fragment>
        );
      })}

      {sending?.map((message) => (
        <LocalMessageItem key={message.nonce} item={message} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-row gap-3 p-4 rounded-xl bg-card">
      <div className="bg-muted-foreground rounded-full h-12 w-12 opacity-20" />
      <div className="flex flex-col gap-3 flex-1 opacity-20">
        <div className="flex flex-row gap-3 items-center">
          <div className="bg-muted-foreground rounded-xl h-4 w-20" />
          <div className="bg-muted-foreground rounded-xl h-4 w-8" />
        </div>
        <div className="bg-muted-foreground rounded-xl h-4 max-w-xl" />
        <div className="bg-muted-foreground rounded-xl h-4 max-w-md" />
      </div>
    </div>
  );
}

function UnreadSeparator() {
  return (
    <div className="flex flex-row gap-2 items-center" aria-label="separator">
      <div className="h-[1px] flex-1 bg-red-500 dark:bg-red-400" />
      <p className="text-red-500 dark:text-red-400 text-sm mx-auto">
        New Message
      </p>
      <div className="h-[1px] flex-1 bg-red-500 dark:bg-red-400" />
    </div>
  );
}

function useLastRead(channelId: string) {
  const { status } = useSession();
  const utils = trpc.useUtils();

  const checkoutQuery = trpc.chat.checkout.useQuery(
    { channelId: channelId },
    {
      enabled: status === "authenticated",
      refetchOnWindowFocus: false,
      onSuccess: () => setChannelUnread(utils, channelId, () => 0),
    },
  );

  return checkoutQuery.data?.last_read != null
    ? new Date(checkoutQuery.data.last_read)
    : null;
}
