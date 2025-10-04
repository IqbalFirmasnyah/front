import { toast } from "sonner";

export function showToast(msg: { title: string; body?: string; url?: string }) {
  toast(msg.title, { description: msg.body });
}
