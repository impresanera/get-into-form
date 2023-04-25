import { PropsWithChildren, useRef } from "react";
import toast from "react-hot-toast";

export function CopyTiClipBoardBox({
  children,
  ...prop
}: PropsWithChildren<{ text: string }>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = () => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.select();
    inputRef.current.setSelectionRange(0, Number.MAX_SAFE_INTEGER);
    navigator.clipboard.writeText(inputRef.current.value);

    toast("Link copied");
  };

  return (
    <>
      <button onClick={() => copy()} {...prop}>
        {children}
      </button>
      <input type="text" ref={inputRef} hidden defaultValue={prop.text} />
    </>
  );
}
