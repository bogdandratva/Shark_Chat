import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogProps,
} from "ui/components/dialog";
import { ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { Avatar } from "ui/components/avatar";
import { Button, button } from "ui/components/button";
import { Spinner } from "ui/components/spinner";
import { useRouter } from "next/navigation";
import { Circle } from "lucide-react";
import { cn } from "ui/utils/cn";

export function UserProfileModal(props: {
  userId: string;
  children: ReactNode;
}) {
  return <UserProfileModalDefault {...props} />;
}

export default function UserProfileModalDefault({
  userId,
  ...props
}: {
  userId: string;
} & DialogProps) {
  return (
    <Dialog {...props}>
      {props.children}
      <DialogContent className="p-0">
        <Content userId={userId} onClose={() => props.onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Content({ userId, onClose }: { userId: string; onClose: () => void }) {
  const utils = trpc.useUtils();
  const query = trpc.account.profile.useQuery({ userId });
  const router = useRouter();
  const status = trpc.chat.status.useQuery({ userId });
  const dmMutation = trpc.dm.open.useMutation({
    onSuccess: (res) => {
      void router.push(`/dm/${res.id}`);
      onClose();
    },
  });

  const onSendMessage = () => {
    const data = utils.dm.channels.getData();

    if (data != null) {
      const channel = data.find((channel) => channel.user.id === userId);

      if (channel != null) {
        router.push(`/dm/${channel.id}`);
        onClose();
        return;
      }
    }

    dmMutation.mutate({
      userId,
    });
  };

  if (query.data == null) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center text-center">
        <Spinner size="medium" />
        <p className="text-xs mt-2">Loading</p>
      </div>
    );
  }

  const user = query.data;

  return (
    <div className="flex flex-col">
      <div className="h-24 bg-gradient-to-b from-brand to-brand-300 rounded-t-lg -mb-12" />
      <div className="px-6 pb-4">
        <Avatar
          fallback={user.name}
          src={user.image}
          size="large"
          className="-ml-2 border-4 border-background"
        />
        <p className="font-semibold mt-2 text-lg">{user.name}</p>
        <p className="text-xs text-muted-foreground mt-1">@{user.id}</p>

        {status.data ? (
          <div className="flex flex-row gap-1 items-center font-medium text-sm mt-4">
            <Circle
              fill="currentColor"
              className={cn(
                "size-4",
                status.data === "Online" ? "text-green-200" : "text-red-200",
              )}
            />
            {status.data}
          </div>
        ) : null}
        <div className="flex flex-row gap-3 mt-8">
          <Button
            color="primary"
            className="flex-1"
            isLoading={dmMutation.isLoading}
            onClick={onSendMessage}
          >
            Send Message
          </Button>
          <DialogClose className={button({ color: "secondary" })}>
            Close
          </DialogClose>
        </div>
      </div>
    </div>
  );
}
