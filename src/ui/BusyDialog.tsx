import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * A blocking progress dialog for an AI job (or anything else slow) that has
 * no visible output of its own to watch while it runs — unlike Draft/Extend/
 * Recast/Polish, which stream their result straight into the prose the
 * author is already looking at, where this dialog would only get in the
 * way. Ported from kaampi Comic's BeatAnalysisDialog (same focus trap,
 * Escape/Cancel, background inert, reduced-motion support) — see its own
 * comment there for the rationale behind each piece of that plumbing.
 */
export function BusyDialog({
  title,
  status,
  help,
  cancelLabel,
  onCancel,
  returnFocus
}: {
  title: string;
  status: string;
  help: string;
  cancelLabel: string;
  onCancel: () => void;
  returnFocus?: HTMLElement | null;
}) {
  const id = useId();
  const backdrop = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const cancel = useRef(onCancel);
  cancel.current = onCancel;

  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const siblings = Array.from(document.body.children).filter((node) => node !== backdrop.current);
    const original = siblings.map((node) => ({ node, inert: node.getAttribute("inert"), hidden: node.getAttribute("aria-hidden") }));
    siblings.forEach((node) => {
      node.setAttribute("inert", "");
      node.setAttribute("aria-hidden", "true");
    });
    document.body.style.overflow = "hidden";
    button.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancel.current();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        button.current?.focus();
      }
    };
    const focus = (event: FocusEvent) => {
      if (!backdrop.current?.contains(event.target as Node)) button.current?.focus();
    };
    document.addEventListener("keydown", key, true);
    document.addEventListener("focusin", focus);
    return () => {
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("focusin", focus);
      document.body.style.overflow = overflow;
      original.forEach(({ node, inert, hidden }) => {
        if (inert === null) node.removeAttribute("inert");
        else node.setAttribute("inert", inert);
        if (hidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", hidden);
      });
      if (active?.isConnected && active !== document.body && !active.matches(":disabled")) active.focus();
      else if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, []);

  return createPortal(
    <div className="busy-dialog-backdrop" ref={backdrop}>
      <section className="busy-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-help`}>
        <svg className="busy-dialog-spinner" width="64" height="64" viewBox="0 0 24 24" aria-hidden="true">
          <g>
            {BUSY_DIALOG_DOTS.map(([cx, cy], index) => (
              <circle key={index} cx={cx} cy={cy} r="1" fill="currentColor" style={{ animationDelay: `${index * 0.1}s` }} />
            ))}
          </g>
        </svg>
        <h2 id={`${id}-title`}>{title}</h2>
        <p className="busy-dialog-status" role="status" aria-live="polite">
          {status}
        </p>
        <p id={`${id}-help`} className="quiet">
          {help}
        </p>
        <button ref={button} type="button" className="busy-dialog-cancel" onClick={onCancel}>
          {cancelLabel}
        </button>
      </section>
    </div>,
    document.body
  );
}

const BUSY_DIALOG_DOTS: Array<[number, number]> = [
  [12, 3],
  [16.5, 4.21],
  [19.79, 7.5],
  [21, 12],
  [19.79, 16.5],
  [16.5, 19.79],
  [12, 21],
  [7.5, 19.79],
  [4.21, 16.5],
  [3, 12],
  [4.21, 7.5],
  [7.5, 4.21]
];
