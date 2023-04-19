import React, { ForwardedRef } from "react";

type BasicInputType = React.InputHTMLAttributes<HTMLInputElement> & {
  type: Extract<
    React.InputHTMLAttributes<HTMLInputElement>["type"],
    "email" | "number" | "password" | "search" | "tel" | "text" | "url"
  >;
} & { errorMessage?: string };
export const BasicInput = React.forwardRef(
  (
    { className, errorMessage, ...props }: BasicInputType,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <>
        <span className="whitespace-break-spaces">
          <input
            ref={ref}
            className={`${className} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            {...props}
          />
          {errorMessage && (
            <p
              id="standard_success_help"
              className="mt-2 text-xs text-red-600 dark:text-red-400"
            >
              {errorMessage}
            </p>
          )}
        </span>
      </>
    );
  }
);
