import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Book, Chapter } from "@core/BookSchema";
import { groupBibleEntities } from "@core/bibleGroups";
import { characterCooccurrence } from "@core/characterCooccurrence";
import { PLOTLINE_COLORS } from "@core/plotlineColors";
import { format, useLocale } from "./i18n";

type SimNode = {
  entityRef: string;
  label: string;
  r: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const WIDTH = 480;
const HEIGHT = 400;
const MIN_DIST = 42;
const MAX_DIST = 190;
const SETTLE_FRAMES = 360;

/**
 * A constellation-style map of which characters share scenes — distance
 * stands for how closely bound two characters are, not an edge you have
 * to trace. Reuses characterCooccurrence.ts's scene-presence data (shared
 * scenes, regardless of whether the two actually talk) rather than
 * dialogue alone, per Mats: "Ska man lägga till när karaktärer finns i
 * samma scen (oavsett om de pratar med varandra)?" The reveal glides
 * nodes out from the center instead of snapping to place — slow by
 * design, not an "explosion" (Mats's correction after the first test).
 */
export function StatsCharacterNetwork({ book, chapters }: { book: Book; chapters: Chapter[] }) {
  const copy = useLocale().messages.stats.report;
  const characters = useMemo(
    () => groupBibleEntities(book.facts, book.entity_kinds).find(({ kind }) => kind === "characters")?.entities ?? [],
    [book.facts, book.entity_kinds]
  );

  const cooccurrence = useMemo(
    () =>
      characterCooccurrence(
        chapters,
        characters.map((c) => ({ entity_ref: c.entity_ref, entity_label: c.entity_label })),
        book.entity_tracking
      ),
    [chapters, characters, book.entity_tracking]
  );

  const nodesRef = useRef<SimNode[]>([]);
  const frameRef = useRef<number | null>(null);
  const [, setTick] = useState(0);
  const [focusRef, setFocusRef] = useState<string | null>(null);

  const dataKey =
    cooccurrence.nodes.map((n) => `${n.entityRef}:${n.scenesMentioned}`).join("|") +
    "::" +
    cooccurrence.pairs.map((p) => `${p.a}-${p.b}:${p.together.toFixed(3)}`).join("|");

  useEffect(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    const maxScenes = Math.max(1, ...cooccurrence.nodes.map((n) => n.scenesMentioned));
    nodesRef.current = cooccurrence.nodes.map((n, i) => {
      const angle = (i / Math.max(1, cooccurrence.nodes.length)) * Math.PI * 2;
      return {
        entityRef: n.entityRef,
        label: n.entityLabel,
        r: 11 + Math.sqrt(n.scenesMentioned / maxScenes) * 22,
        color: `var(--plotline-${PLOTLINE_COLORS[i % PLOTLINE_COLORS.length]})`,
        x: WIDTH / 2 + Math.cos(angle) * 4,
        y: HEIGHT / 2 + Math.sin(angle) * 4,
        vx: 0,
        vy: 0
      };
    });
    setFocusRef(null);
    setTick((t) => t + 1);

    let framesLeft = SETTLE_FRAMES;

    function tickFrame() {
      const nodes = nodesRef.current;
      const byRef = new Map(nodes.map((n) => [n.entityRef, n] as const));
      const t = 1 - framesLeft / SETTLE_FRAMES;
      const ease = Math.sin(t * Math.PI); // slow start, slow finish — a glide, not a burst
      const maxSpeed = 0.3 + ease * 1.8;

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          if (!a || !b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const repel = 2000 / (dist * dist);
          const fx = (dx / dist) * repel;
          const fy = (dy / dist) * repel;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }
      }
      for (const pair of cooccurrence.pairs) {
        const a = byRef.get(pair.a);
        const b = byRef.get(pair.b);
        if (!a || !b) continue;
        const target = MAX_DIST - pair.together * (MAX_DIST - MIN_DIST);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const k = 0.02 + pair.together * 0.03;
        const diff = (dist - target) * k;
        const fx = (dx / dist) * diff;
        const fy = (dy / dist) * diff;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      for (const n of nodes) {
        n.vx += (WIDTH / 2 - n.x) * 0.0025;
        n.vy += (HEIGHT / 2 - n.y) * 0.0025;
      }
      for (const n of nodes) {
        n.vx *= 0.82; n.vy *= 0.82;
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > maxSpeed) { n.vx = (n.vx / speed) * maxSpeed; n.vy = (n.vy / speed) * maxSpeed; }
        n.x += n.vx; n.y += n.vy;
        const pad = n.r + 12;
        n.x = Math.max(pad, Math.min(WIDTH - pad, n.x));
        n.y = Math.max(pad, Math.min(HEIGHT - pad, n.y));
      }

      setTick((prev) => prev + 1);
      framesLeft -= 1;
      frameRef.current = framesLeft > 0 ? requestAnimationFrame(tickFrame) : null;
    }
    frameRef.current = requestAnimationFrame(tickFrame);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  if (characters.length < 2 || cooccurrence.pairs.length === 0) {
    return (
      <article className="stats-report-copy">
        <h3>{copy.network}</h3>
        <p>{copy.networkEmpty}</p>
      </article>
    );
  }

  const nodes = nodesRef.current;
  const byRef = new Map(nodes.map((n) => [n.entityRef, n] as const));

  function connected(a: string, b: string) {
    return cooccurrence.pairs.some((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a));
  }

  const focusItems = focusRef
    ? cooccurrence.pairs
        .filter((p) => p.a === focusRef || p.b === focusRef)
        .map((p) => ({ other: p.a === focusRef ? p.b : p.a, together: p.together }))
        .sort((x, y) => y.together - x.together)
        .slice(0, 3)
    : [];

  return (
    <article className="stats-report-copy stats-network">
      <h3>{copy.network}</h3>
      <p>{copy.networkMethod}</p>
      <svg className="stats-network-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={copy.network}>
        <g>
          {cooccurrence.pairs.map((pair) => {
            const a = byRef.get(pair.a);
            const b = byRef.get(pair.b);
            if (!a || !b) return null;
            const dim = Boolean(focusRef) && pair.a !== focusRef && pair.b !== focusRef;
            return (
              <line
                key={`${pair.a}-${pair.b}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={focusRef && !dim ? "var(--stats-button-color)" : "var(--border)"}
                strokeWidth={0.6 + pair.together * 4}
                opacity={dim ? 0.1 : 0.3 + pair.together * 0.6}
              />
            );
          })}
        </g>
        <g>
          {nodes.map((n) => {
            const dim = Boolean(focusRef) && focusRef !== n.entityRef && !connected(focusRef!, n.entityRef);
            return (
              <g
                key={n.entityRef}
                transform={`translate(${n.x},${n.y})`}
                opacity={dim ? 0.3 : 1}
                tabIndex={0}
                role="button"
                aria-label={n.label}
                style={{ cursor: "pointer" }}
                onClick={() => setFocusRef((current) => (current === n.entityRef ? null : n.entityRef))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setFocusRef((current) => (current === n.entityRef ? null : n.entityRef));
                  }
                }}
              >
                <g style={{ clipPath: `circle(${n.r}px at 0 0)` }}>
                  <circle r={n.r} fill={n.color} />
                  <circle r={n.r * 0.38} cy={-n.r * 0.18} fill="rgba(255,255,255,0.88)" />
                  <path
                    d={`M ${-n.r * 1.1} ${n.r * 1.15} Q ${-n.r * 1.1} ${n.r * 0.32} 0 ${n.r * 0.32} Q ${n.r * 1.1} ${n.r * 0.32} ${n.r * 1.1} ${n.r * 1.15} Z`}
                    fill="rgba(255,255,255,0.88)"
                  />
                </g>
                <circle r={n.r} fill="none" stroke="var(--stats-button-color)" strokeWidth={focusRef === n.entityRef ? 3 : 0} />
                <text
                  y={-(n.r + 9)}
                  textAnchor="middle"
                  fontSize="13"
                  fill="var(--text)"
                  stroke="var(--panel)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  style={{ fontWeight: 600, pointerEvents: "none" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <p className="stats-network-hint" aria-live="polite">
        {focusRef && focusItems.length > 0
          ? format(copy.networkFocus, {
              name: nodes.find((n) => n.entityRef === focusRef)?.label ?? "",
              list: focusItems.map((item) => nodes.find((n) => n.entityRef === item.other)?.label ?? "").join(", ")
            })
          : copy.networkHint}
      </p>
      <div className="stats-network-legend">
        <span>{copy.networkLegendSize}</span>
        <span>{copy.networkLegendLine}</span>
      </div>
    </article>
  );
}
