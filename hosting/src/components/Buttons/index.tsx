import { PropsWithChildren } from "react";

type BasicButtonPorpTypes = PropsWithChildren<{
  loading?: boolean;
  text?: string;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  className?: React.HTMLAttributes<HTMLButtonElement>["className"];
}> &
  React.HTMLAttributes<HTMLButtonElement>;

export const BasicButton = ({
  loading,
  type = "button",
  text,
  className,
  children,
  ...props
}: BasicButtonPorpTypes) => {
  return (
    <button
      {...props}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-200 ${
        className ?? ""
      }`}
      type="submit"
      disabled={loading}
    >
      {text || children}
    </button>
  );
};
