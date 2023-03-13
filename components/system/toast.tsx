import * as Base from "@radix-ui/react-toast";
import { usePageStore } from "@/stores/page";
import { ReactNode } from "react";
import { text } from "./text";
import { tv, VariantProps } from "tailwind-variants";

export const toast = tv({
    slots: {
        root: [
            "rounded-xl bg-white dark:bg-dark-800 p-3 shadow-2xl shadow-brand-500/10",
            "dark:shadow-none",
        ],
    },
    variants: {
        color: {
            red: {
                root: "border-[1px] border-red-500",
            },
            normal: {
                root: "dark:border-2 dark:border-dark-600",
            },
        },
    },
    defaultVariants: {
        color: "normal",
    },
});

export function ToastProvider({ children }: { children?: ReactNode }) {
    const [errors, remove] = usePageStore((s) => [s.errors, s.removeError]);

    return (
        <Base.Provider swipeDirection="right">
            {errors.map((error, i) => (
                <Toast
                    key={`${error.id}-${i}`}
                    title={error.title}
                    description={error.description}
                    color="red"
                    onOpenChange={(open) => {
                        if (!open) {
                            remove(error.id, i);
                        }
                    }}
                />
            ))}
            {children}
            <Base.Viewport className="fixed bottom-0 right-0 z-50 w-80 max-w-[100vw] p-3" />
        </Base.Provider>
    );
}

export type ToastProps = Omit<Base.ToastProps, "color"> & {
    title: string;
    description: string;
} & VariantProps<typeof toast>;

export function Toast({
    title,
    description,
    children,
    color,
    ...rest
}: ToastProps) {
    const styles = toast({ color });

    return (
        <Base.Root {...rest} className={styles.root()}>
            <Base.Title className={text({ type: "primary", size: "lg" })}>
                {title}
            </Base.Title>
            <Base.Description className={text({ type: "secondary" })}>
                {description}
            </Base.Description>
            {children}
        </Base.Root>
    );
}
