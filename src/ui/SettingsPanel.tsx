import React, { useEffect, useState } from "react";
import { CloseIconButton } from "./CloseIconButton";
import { peopleLabels } from "@core/bibleGroups";
import {
  ADVANCED_POV_MODES,
  PRIMARY_POV_MODES,
  TENSES,
  needsViewpoint,
  parsePov,
  parseTense
} from "@core/craft";
import { READER_CATEGORIES, READER_TIER_AGE, applyReaderAge, readerCategory, type ReaderCategory } from "@core/reader";
import { findStyleByPromptText, ILLUSTRATION_ORIENTATIONS, type IllustrationStyle } from "@core/illustrationStyle";
import { PUBLISH_FONTS } from "@core/publishFonts";
import { DEFAULT_POLISH_PROMPT, type Book } from "@core/BookSchema";
import { BlobThumbnail } from "./BlobThumbnail";
import { HelpTip } from "./GuidePanel";
import { format, useLocale } from "./i18n";

export function SettingsPanel({
  book,
  illustrationStyles,
  onPatch,
  onBrowseIllustrationLibrary,
  onClose
}: {
  book: Book;
  illustrationStyles: IllustrationStyle[];
  onPatch: (mutate: (book: Book) => Book) => void;
  onBrowseIllustrationLibrary: () => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const people = peopleLabels(book.facts, book.entity_kinds);
  const showViewpoint = needsViewpoint(book.pov);
  const selectedStyle = findStyleByPromptText(illustrationStyles, book.illustration_style);
  const [editingText, setEditingText] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="edit-overlay" role="presentation" onClick={onClose}>
      <div
        className="edit-card settings-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <span className="settings-card-title">
            <h2 id="settings-title">{m.editor.settings}</h2>
            <HelpTip body={m.editor.settingsLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.settings })} />
          </span>
          <CloseIconButton onClick={onClose} label={m.common.close} />
        </div>

        <div className="settings-card-columns">
          <div className="settings-card-column">
            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.generalHeading}</h2>
              <div className="settings-field-row">
                <label className="voice-field">
                  <span className="field-label-row">
                    {m.editor.proseLanguage}
                    <HelpTip body={m.editor.proseLanguageTitle} ariaLabel={format(m.common.infoAbout, { field: m.editor.proseLanguage })} />
                  </span>
                  <input
                    value={book.prose_language}
                    onChange={(event) => onPatch((current) => ({ ...current, prose_language: event.target.value }))}
                    placeholder={m.editor.proseLanguagePlaceholder}
                    aria-label={m.editor.proseLanguage}
                  />
                </label>
                <label className="reader-field">
                  <span className="field-label-row">
                    {m.editor.reader}
                    <HelpTip body={m.editor.readerTitle} ariaLabel={format(m.common.infoAbout, { field: m.editor.reader })} />
                  </span>
                  <select
                    value={book.reader_age === undefined ? "adult" : readerCategory(book.reader_age)}
                    aria-label={m.editor.reader}
                    onChange={(event) => {
                      const category = event.target.value as ReaderCategory;
                      const age = category === "adult" ? undefined : READER_TIER_AGE[category];
                      onPatch((current) => applyReaderAge(current, age));
                    }}
                  >
                    {READER_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {m.editor.readerCategories[category]}
                      </option>
                    ))}
                  </select>
                  {readerCategory(book.reader_age) !== "adult" ? <p className="reader-hint">{m.editor.readerTierHint}</p> : null}
                </label>
              </div>
              <div className="craft-fields">
                <label className="craft-field">
                  <span>{m.craft.pov}</span>
                  <select value={book.pov} onChange={(event) => onPatch((current) => ({ ...current, pov: parsePov(event.target.value) }))} aria-label={m.craft.povAria}>
                    <PovModeOptions />
                  </select>
                </label>
                <label className="craft-field">
                  <span>{m.craft.tense}</span>
                  <select
                    value={book.tense}
                    onChange={(event) => onPatch((current) => ({ ...current, tense: parseTense(event.target.value) }))}
                    aria-label={m.craft.tenseAria}
                  >
                    {TENSES.map((mode) => (
                      <option key={mode} value={mode}>
                        {m.craft.tenses[mode]}
                      </option>
                    ))}
                  </select>
                </label>
                {showViewpoint ? (
                  <label className="craft-field">
                    <span>{m.craft.viewpoint}</span>
                    <input
                      list="settings-viewpoint-people"
                      value={book.viewpoint}
                      onChange={(event) => onPatch((current) => ({ ...current, viewpoint: event.target.value }))}
                      placeholder={m.craft.viewpointPlaceholder}
                      aria-label={m.craft.viewpointAria}
                    />
                    {people.length > 0 ? (
                      <datalist id="settings-viewpoint-people">
                        {people.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    ) : null}
                  </label>
                ) : null}
              </div>
              <label className="voice-field">
                <span>{m.editor.voice}</span>
                <textarea
                  value={book.voice}
                  onChange={(event) => onPatch((current) => ({ ...current, voice: event.target.value }))}
                  placeholder={m.editor.voicePlaceholder}
                  rows={3}
                />
              </label>
            </section>

            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.typographyHeading}</h2>
              <div className="craft-fields">
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.bodyFontLabel}
                    <HelpTip body={m.editor.bodyFontLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.bodyFontLabel })} />
                  </span>
                  <select
                    value={book.body_font}
                    onChange={(event) => onPatch((current) => ({ ...current, body_font: event.target.value as Book["body_font"] }))}
                    aria-label={m.editor.bodyFontLabel}
                  >
                    <optgroup label={m.editor.fontCategorySerif}>
                      {PUBLISH_FONTS.filter((font) => font.category === "serif").map((font) => (
                        <option key={font.id} value={font.id} style={{ fontFamily: font.stack }}>
                          {font.id === "system" ? m.publish.systemFont : font.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={m.editor.fontCategorySans}>
                      {PUBLISH_FONTS.filter((font) => font.category === "sans").map((font) => (
                        <option key={font.id} value={font.id} style={{ fontFamily: font.stack }}>
                          {font.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.bodyWeightLabel}
                    <HelpTip
                      body={m.editor.bodyWeightLede}
                      ariaLabel={format(m.common.infoAbout, { field: m.editor.bodyWeightLabel })}
                    />
                  </span>
                  <select
                    value={book.body_font_weight}
                    onChange={(event) =>
                      onPatch((current) => ({ ...current, body_font_weight: event.target.value as Book["body_font_weight"] }))
                    }
                    aria-label={m.editor.bodyWeightLabel}
                  >
                    <option value="regular">{m.editor.bodyWeightRegular}</option>
                    <option value="bold">{m.editor.bodyWeightBold}</option>
                  </select>
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.bodyColorDarkLabel}
                    <HelpTip
                      body={m.editor.bodyColorLede}
                      ariaLabel={format(m.common.infoAbout, { field: m.editor.bodyColorDarkLabel })}
                    />
                  </span>
                  <input
                    type="color"
                    value={book.body_color_dark}
                    onChange={(event) => onPatch((current) => ({ ...current, body_color_dark: event.target.value }))}
                    aria-label={m.editor.bodyColorDarkLabel}
                  />
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.bodyColorLightLabel}
                    <HelpTip
                      body={m.editor.bodyColorLede}
                      ariaLabel={format(m.common.infoAbout, { field: m.editor.bodyColorLightLabel })}
                    />
                  </span>
                  <input
                    type="color"
                    value={book.body_color_light}
                    onChange={(event) => onPatch((current) => ({ ...current, body_color_light: event.target.value }))}
                    aria-label={m.editor.bodyColorLightLabel}
                  />
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.dropCapLabel}
                    <HelpTip body={m.editor.dropCapLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.dropCapLabel })} />
                  </span>
                  <select
                    value={String(book.drop_cap_lines)}
                    onChange={(event) => onPatch((current) => ({ ...current, drop_cap_lines: Number(event.target.value) }))}
                    aria-label={m.editor.dropCapLabel}
                  >
                    <option value="0">{m.editor.dropCapOff}</option>
                    {[2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {format(m.editor.dropCapLines, { n })}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.sceneBreakLabel}
                    <HelpTip
                      body={m.editor.sceneBreakLede}
                      ariaLabel={format(m.common.infoAbout, { field: m.editor.sceneBreakLabel })}
                    />
                  </span>
                  <select
                    value={book.scene_break_style}
                    onChange={(event) =>
                      onPatch((current) => ({ ...current, scene_break_style: event.target.value as Book["scene_break_style"] }))
                    }
                    aria-label={m.editor.sceneBreakLabel}
                  >
                    <option value="plain">{m.editor.sceneBreakPlain}</option>
                    <option value="vignette">{m.editor.sceneBreakVignette}</option>
                    <option value="diamond">{m.editor.sceneBreakDiamond}</option>
                    <option value="fleur">{m.editor.sceneBreakFleur}</option>
                    <option value="sparkle">{m.editor.sceneBreakSparkle}</option>
                  </select>
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.pageSizeLabel}
                    <HelpTip body={m.editor.pageSizeLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.pageSizeLabel })} />
                  </span>
                  <select
                    value={book.page_size}
                    onChange={(event) => onPatch((current) => ({ ...current, page_size: event.target.value as Book["page_size"] }))}
                    aria-label={m.editor.pageSizeLabel}
                  >
                    <option value="6x9">{m.editor.pageSize6x9}</option>
                    <option value="a4">{m.editor.pageSizeA4}</option>
                    <option value="letter">{m.editor.pageSizeLetter}</option>
                  </select>
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.pageMarginLabel}
                    <HelpTip body={m.editor.pageMarginLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.pageMarginLabel })} />
                  </span>
                  <select
                    value={book.page_margin}
                    onChange={(event) => onPatch((current) => ({ ...current, page_margin: event.target.value as Book["page_margin"] }))}
                    aria-label={m.editor.pageMarginLabel}
                  >
                    <option value="narrow">{m.editor.pageMarginNarrow}</option>
                    <option value="normal">{m.editor.pageMarginNormal}</option>
                    <option value="wide">{m.editor.pageMarginWide}</option>
                  </select>
                </label>
                <label className="craft-field">
                  <span className="field-label-row">
                    {m.editor.editorBackgroundLabel}
                    <HelpTip
                      body={m.editor.editorBackgroundLede}
                      ariaLabel={format(m.common.infoAbout, { field: m.editor.editorBackgroundLabel })}
                    />
                  </span>
                  <select
                    value={book.editor_background}
                    onChange={(event) =>
                      onPatch((current) => ({ ...current, editor_background: event.target.value as Book["editor_background"] }))
                    }
                    aria-label={m.editor.editorBackgroundLabel}
                  >
                    <option value="none">{m.editor.editorBackgroundNone}</option>
                    <option value="forest">{m.editor.editorBackgroundForest}</option>
                    <option value="milky-way">{m.editor.editorBackgroundMilkyWay}</option>
                    <option value="cork">{m.editor.editorBackgroundCork}</option>
                    <option value="triangles">{m.editor.editorBackgroundTriangles}</option>
                    <option value="fabric">{m.editor.editorBackgroundFabric}</option>
                    <option value="school">{m.editor.editorBackgroundSchool}</option>
                    <option value="pine">{m.editor.editorBackgroundPine}</option>
                    <option value="leaves">{m.editor.editorBackgroundLeaves}</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.illustrationsHeading}</h2>
              <div className="illustration-style-preview-field">
                <span className="field-label">{m.illustration.fieldLabel}</span>
                <button type="button" className="illustration-style-preview" onClick={onBrowseIllustrationLibrary}>
                  {selectedStyle?.exampleImage ? (
                    <BlobThumbnail blob={selectedStyle.exampleImage.blob} alt={selectedStyle.name} variant="settings" />
                  ) : (
                    <span className="illustration-style-settings-thumb illustration-style-placeholder" aria-hidden="true" />
                  )}
                  <span className="illustration-style-preview-info">
                    <strong className="illustration-style-preview-name">
                      {selectedStyle?.name ?? (book.illustration_style.trim() ? m.illustration.customStyleLabel : m.illustration.noStyleSelected)}
                    </strong>
                    <span className="illustration-style-preview-cta">{m.illustration.browseLibrary}</span>
                  </span>
                </button>
                <div className="illustration-orientation-toggle" role="group" aria-label={m.illustration.orientationLabel}>
                  {ILLUSTRATION_ORIENTATIONS.map((orientation) => (
                    <button
                      key={orientation}
                      type="button"
                      className="text-button"
                      aria-pressed={book.illustration_orientation === orientation}
                      onClick={() => onPatch((current) => ({ ...current, illustration_orientation: orientation }))}
                    >
                      {m.illustration.orientations[orientation]}
                    </button>
                  ))}
                </div>
                <button type="button" className="text-button illustration-style-edit-toggle" onClick={() => setEditingText((v) => !v)}>
                  {editingText ? m.illustration.hideManualEdit : m.illustration.editTextManually}
                </button>
                {editingText ? (
                  <textarea
                    value={book.illustration_style}
                    onChange={(event) => onPatch((current) => ({ ...current, illustration_style: event.target.value }))}
                    rows={3}
                  />
                ) : null}
              </div>
            </section>
          </div>

          <div className="settings-card-column">
            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.proofreadHeading}</h2>
              <label className="craft-field">
                <span className="field-label-row">
                  {m.editor.proofreadThoroughnessLabel}
                  <HelpTip
                    body={m.editor.proofreadThoroughnessLede}
                    ariaLabel={format(m.common.infoAbout, { field: m.editor.proofreadThoroughnessLabel })}
                  />
                </span>
                <select
                  value={book.proofread_thoroughness}
                  onChange={(event) =>
                    onPatch((current) => ({
                      ...current,
                      proofread_thoroughness: event.target.value as Book["proofread_thoroughness"]
                    }))
                  }
                  aria-label={m.editor.proofreadThoroughnessLabel}
                >
                  <option value="fast">{m.editor.proofreadThoroughnessFast}</option>
                  <option value="balanced">{m.editor.proofreadThoroughnessBalanced}</option>
                  <option value="thorough">{m.editor.proofreadThoroughnessThorough}</option>
                </select>
              </label>
              <div className="settings-checkbox-row">
                <label className="settings-checkbox-field">
                  <input
                    type="checkbox"
                    checked={book.filter_lore_by_relevance}
                    onChange={(event) => onPatch((current) => ({ ...current, filter_lore_by_relevance: event.target.checked }))}
                  />
                  {m.editor.filterLoreLabel}
                </label>
                <HelpTip body={m.editor.filterLoreLede} ariaLabel={format(m.common.infoAbout, { field: m.editor.filterLoreLabel })} />
              </div>
            </section>

            <section className="settings-block">
              <h2 className="settings-heading">{m.editor.polish}</h2>
              <label className="voice-field">
                <span className="field-label-row">
                  {m.editor.polishPromptLabel}
                  <HelpTip
                    body={m.editor.polishPromptLede}
                    ariaLabel={format(m.common.infoAbout, { field: m.editor.polishPromptLabel })}
                  />
                </span>
                <textarea
                  className="primer-field"
                  value={book.polish_prompt}
                  onChange={(event) => onPatch((current) => ({ ...current, polish_prompt: event.target.value }))}
                  rows={10}
                  aria-label={m.editor.polishPromptAria}
                />
              </label>
              <div className="edit-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => onPatch((current) => ({ ...current, polish_prompt: DEFAULT_POLISH_PROMPT }))}
                  disabled={book.polish_prompt.trim() === DEFAULT_POLISH_PROMPT.trim()}
                >
                  {m.editor.polishPromptRestore}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelSelect({
  label,
  value,
  models,
  emptyLabel,
  onChange,
  followLabel
}: {
  label: string;
  value: string;
  models: string[];
  emptyLabel: string;
  onChange: (name: string) => void;
  /**
   * When set, adds a leading "follow another model" option (value "") that
   * stays selected rather than being forced to `models[0]` — used by the
   * Translate model select (roadmap-ideas.md #43), which has no hardcoded
   * default of its own and falls back to the Writing model when unset.
   */
  followLabel?: string;
}) {
  const resolved = value === "" && followLabel !== undefined ? "" : models.includes(value) ? value : models[0] ?? "";
  return (
    <label className="model-field settings-model">
      <span>{label}</span>
      <select
        value={resolved}
        onChange={(event) => onChange(event.target.value)}
        disabled={models.length === 0}
        aria-label={label}
      >
        {models.length === 0 ? <option value="">{emptyLabel}</option> : null}
        {followLabel !== undefined && models.length > 0 ? <option value="">{followLabel}</option> : null}
        {models.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function PovModeOptions() {
  const { messages: m } = useLocale();
  return (
    <>
      <optgroup label={m.craft.usual}>
        {PRIMARY_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {m.craft.modes[mode]}
          </option>
        ))}
      </optgroup>
      <optgroup label={m.craft.more}>
        {ADVANCED_POV_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {m.craft.modes[mode]}
          </option>
        ))}
      </optgroup>
    </>
  );
}
