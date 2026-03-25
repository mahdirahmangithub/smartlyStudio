import type { ReactNode } from "react";
import type { ToastType, ToastLayout, ToastAction } from "./Toast";

export interface ToastData {
  id: number | string;
  title: string;
  description?: string;
  type?: ToastType;
  layout?: ToastLayout;
  ctaAction?: ToastAction;
  undoAction?: ToastAction;
  icon?: ReactNode;
  /** Duration in ms before auto-dismiss. `Infinity` = persistent. */
  duration?: number;
  /** @internal Set when dismiss is triggered */
  dismiss?: boolean;
  /** @internal Set when delete animation completes */
  delete?: boolean;
}

export interface ExternalToast
  extends Omit<ToastData, "id" | "title" | "dismiss" | "delete"> {
  id?: number | string;
}

export type ToastToDismiss = { id: number | string; dismiss: true };

const DEFAULT_DURATION = 5000;
const MS_PER_CHAR = 50;
const MIN_DURATION = 3000;

/**
 * Calculate auto-hide duration based on content length.
 * Returns at least MIN_DURATION, scaling up with character count.
 */
function calculateDuration(title: string, description?: string): number {
  const text = description ? `${title} ${description}` : title;
  return Math.max(MIN_DURATION, Math.min(text.length * MS_PER_CHAR, 10000));
}

let toastCounter = 0;

type Subscriber = (toast: ToastData | ToastToDismiss) => void;

class ToastObserver {
  subscribers: Subscriber[] = [];
  toasts: ToastData[] = [];

  subscribe = (subscriber: Subscriber) => {
    this.subscribers.push(subscriber);
    return () => {
      const idx = this.subscribers.indexOf(subscriber);
      if (idx > -1) this.subscribers.splice(idx, 1);
    };
  };

  private publish = (data: ToastData | ToastToDismiss) => {
    this.subscribers.forEach((sub) => sub(data));
  };

  private addToast = (data: ToastData) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
  };

  create = (title: string, data?: ExternalToast) => {
    const id = data?.id ?? ++toastCounter;
    const existing = this.toasts.find((t) => t.id === id);

    const duration =
      data?.duration ??
      calculateDuration(title, data?.description) ??
      DEFAULT_DURATION;

    if (existing) {
      this.toasts = this.toasts.map((t) =>
        t.id === id
          ? { ...t, ...data, id, title, duration }
          : t
      );
      this.publish({ ...existing, ...data, id, title, duration });
    } else {
      this.addToast({ title, ...data, id, duration });
    }

    return id;
  };

  dismiss = (id?: number | string) => {
    if (id) {
      this.publish({ id, dismiss: true });
    } else {
      this.toasts.forEach((t) =>
        this.publish({ id: t.id, dismiss: true })
      );
    }
    return id;
  };

  success = (title: string, data?: ExternalToast) =>
    this.create(title, { ...data, type: "success" });

  alert = (title: string, data?: ExternalToast) =>
    this.create(title, { ...data, type: "alert" });

  neutral = (title: string, data?: ExternalToast) =>
    this.create(title, { ...data, type: "neutral" });

  getActiveToasts = () =>
    this.toasts.filter((t) => !t.dismiss);
}

export const toastState = new ToastObserver();

const toastFn = (title: string, data?: ExternalToast) =>
  toastState.create(title, data);

export const toast = Object.assign(toastFn, {
  success: toastState.success,
  alert: toastState.alert,
  neutral: toastState.neutral,
  dismiss: toastState.dismiss,
});
