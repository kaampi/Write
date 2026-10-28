import { useState } from "react";
import { CRITIC_PERSONA_IDS, type CriticPersonaId } from "@core/critics";
import { useLocale } from "./i18n";
import { CloseIconButton } from "./CloseIconButton";

/**
 * Shown before every critics run — pick which voices read this chapter.
 * Unlike ProofreadSetupCard (everything checked by default, since a
 * manuscript-wide pass is rare and opt-out is the right default there),
 * this starts with nothing checked: each persona is its own AI call, so
 * the author should choose the cost each time, not just accept it.
 */
export function CriticsSetupCard({ onStart, onClose }: { onStart: (personas: CriticPersonaId[]) => void; onClose: () => void }) {
  const { messages: m } = useLocale();
  const [personas, setPersonas] = useState<Set<CriticPersonaId>>(new Set());

  function togglePersona(persona: CriticPersonaId) {
    setPersonas((prev) => {
      const next = new Set(prev);
      if (next.has(persona)) next.delete(persona);
      else next.add(persona);
      return next;
    });
  }

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card" role="dialog" aria-modal="true" aria-labelledby="critics-setup-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.critics.action}</p>
          <CloseIconButton onClick={onClose} label={m.common.close} />
        </div>
        <h2 id="critics-setup-title">{m.critics.setupTitle}</h2>
        <p className="quiet">{m.critics.setupLede}</p>

        <fieldset className="proofread-setup-stages">
          <legend className="chapter-craft-label">{m.critics.setupPersonasLabel}</legend>
          {CRITIC_PERSONA_IDS.map((persona) => (
            <label key={persona} className="proofread-setup-stage critics-setup-persona">
              <input type="checkbox" checked={personas.has(persona)} onChange={() => togglePersona(persona)} />
              <span>
                <span className="critics-setup-persona-label">{m.critics.personas[persona].label}</span>
                <span className="quiet critics-setup-persona-blurb">{m.critics.personas[persona].blurb}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button
            type="button"
            className="primary"
            disabled={personas.size === 0}
            title={personas.size === 0 ? m.critics.setupNothingSelected : undefined}
            onClick={() => onStart(CRITIC_PERSONA_IDS.filter((persona) => personas.has(persona)))}
          >
            {m.critics.setupStart}
          </button>
        </div>
      </div>
    </div>
  );
}
