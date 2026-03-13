import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
  const sizes = size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";
  const variants =
    variant === "primary"
      ? "bg-white text-zinc-950 hover:bg-white/90"
      : variant === "danger"
        ? "bg-rose-500 text-white hover:bg-rose-500/90"
        : "bg-white/10 text-white hover:bg-white/15";
  return (
    <button
      className={[base, sizes, variants, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

