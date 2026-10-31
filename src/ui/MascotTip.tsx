import { useState } from "react";
import { pickMascotPose, type MascotId } from "./mascot";

/**
 * One mascot speech bubble (Home's "New here?" tip is the first spot this
 * is used in). `action` absent -> a short, pointed bubble (see .has-point
 * in styles.css for why it's capped at ~2 lines); `action` present -> a
 * plain rounded card with a docked button instead, no point.
 *
 * Picks one of the character's poses at random on mount, so the same
 * picture doesn't show every time (Mats, 2026-10-31). The caller passes
 * `key={mascot}` (Home.tsx does) so switching characters in Settings
 * re-mounts this and re-rolls, rather than keeping the old character's
 * pose string around.
 */
export function MascotTip({
  mascot,
  name,
  text,
  action
}: {
  mascot: Exclude<MascotId, "none">;
  name: string;
  text: string;
  action?: { label: string; onClick: () => void };
}) {
  const [pose] = useState(() => pickMascotPose(mascot));
  return (
    <div className="mascot-tip">
      <img className="mascot-tip-avatar" src={pose} alt={name} />
      <div className={action ? "mascot-bubble has-action" : "mascot-bubble has-point"}>
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
  );
}
