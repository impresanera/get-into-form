import { PropsWithChildren, useRef } from "react";

export function CopyTiClipBoardBox({
  children,
  onClick,
  ...prop
}: PropsWithChildren<{ text: string; onClick?: () => void }>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = () => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.select();
    inputRef.current.setSelectionRange(0, Number.MAX_SAFE_INTEGER);
    navigator.clipboard.writeText(inputRef.current.value);
  };

  return (
    <>
      <button
        onClick={() => {
          copy();
          if (onClick) {
            onClick();
          }
        }}
        {...prop}
      >
        {children}
      </button>
      <input type="text" ref={inputRef} hidden defaultValue={prop.text} />
    </>
  );
}
