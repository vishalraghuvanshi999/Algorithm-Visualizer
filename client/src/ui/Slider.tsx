import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Slider({ className, ...props }: Props) {
  return (
    <input
      type="range"
      className={[
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

