import { useState } from "react";
import { pickMascotPose, type MascotId } from "./mascot";

/**
 * One mascot speech bubble (Home's "New here?" tip is the first spot this
 * is used in). `action` absent -> a short bubble (see .has-point in
 * styles.css, capped at ~2 lines); `action` present -> a taller card with
 * a docked button instead. Both get the same CSS tail pointing at the
 * mascot's mouth (see .mascot-bubble::before/::after in styles.css) - the
 * `.mascot-bubble-content` wrapper around each bubble's own content is
 * what makes that possible: it carries the line-clamp instead of the
 * bubble itself, so the bubble's own box stays unclipped for the tail.
 *
 * `intro`, when given, adds a second bubble to the right of the main one
 * (Mats, 2026-10-31: Kaamilla's one-time "This is Kaamilla, your
 * assistant..." bubble, shown next to her existing Guide tip the first
 * time she appears as the new default) - its own dismiss button, not tied
 * to `action`.
 *
 * Picks one of the character's poses at random on mount, so the same
 * picture doesn't show every time (Mats, 2026-10-31). The caller passes
 * `key={mascot}` (Home.tsx does) so switching characters in Settings
 * re-mounts this and re-rolls, rather than keeping the old character's
 * pose string around.
 *
 * `onClose`, when given, adds a small × in the main bubble's own top-right
 * corner (Mats, 2026-11-04: "ett sätt att säga OK, jag fattar") — a
 * quieter, always-available alternative to turning the assistant off in
 * Settings. The bubble gets its own `has-close` modifier (extra right
 * padding/width, not shared with `has-action`'s button row) so the × never
 * sits over the text.
 */
export function MascotTip({
  mascot,
  name,
  text,
  action,
  intro,
  onClose,
  closeLabel
}: {
  mascot: Exclude<MascotId, "none">;
  name: string;
  text: string;
  action?: { label: string; onClick: () => void };
  intro?: { text: string; actionLabel: string; onDismiss: () => void };
  onClose?: () => void;
  closeLabel?: string;
}) {
  const [pose] = useState(() => pickMascotPose(mascot));
  return (
    <div className="mascot-tip">
      <img className="mascot-tip-avatar" src={pose} alt={name} />
      <div className="mascot-tip-bubbles">
        <div
          className={[action ? "mascot-bubble has-action" : "mascot-bubble has-point", onClose ? "has-close" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {onClose ? (
            <button type="button" className="mascot-bubble-close" onClick={onClose} aria-label={closeLabel}>
              ×
            </button>
          ) : null}
          <div className="mascot-bubble-content">
            <span>{text}</span>
            {action ? (
              <div className="mascot-bubble-action-row">
                <button type="button" className="primary" onClick={action.onClick}>
                  {action.label}
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {intro ? (
          <div className="mascot-bubble has-action">
            <div className="mascot-bubble-content">
              <span>{intro.text}</span>
              <div className="mascot-bubble-action-row">
                <button type="button" className="primary" onClick={intro.onDismiss}>
                  {intro.actionLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
