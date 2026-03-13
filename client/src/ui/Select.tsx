import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: Props) {
  return (
    <select
      className={[
        "h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

