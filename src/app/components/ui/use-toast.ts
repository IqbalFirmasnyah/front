"use client";

type ToastArgs = { title?: string; description?: string };

export function useToast() {
  return {
    toast: ({ title, description }: ToastArgs) => {
      if (typeof window !== "undefined") {
        alert(`${title ?? "Notifikasi"}\n${description ?? ""}`);
      } else {
        console.log("[toast]", title, description);
      }
    },
  };
}

export function toast(args: ToastArgs) {
  if (typeof window !== "undefined") {
    alert(`${args.title ?? "Notifikasi"}\n${args.description ?? ""}`);
  } else {
    console.log("[toast]", args.title, args.description);
  }
}
