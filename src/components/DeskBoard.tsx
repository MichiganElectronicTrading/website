"use client";

import { useState } from "react";
import Image from "next/image";
import FilterButtons from "./FilterButtons";
import Placeholder from "./Placeholder";
import { desks } from "@/data/desks";
import styles from "./DeskBoard.module.css";

const FILTERS = ["All", "Research", "Trading"] as const;

export default function DeskBoard() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = filter === "All" ? desks : desks.filter((d) => d.stage === filter);

  return (
    <>
      <FilterButtons label="Filter desks" options={FILTERS} value={filter} onChange={setFilter} />
      <div className={styles.grid} data-reveal-grid>
        {/* Keyed by filter so every switch rebuilds the grid and the cards fade in left to right. */}
        {shown.map((desk) => (
          <article key={`${filter}-${desk.name}`} className={styles.card}>
            {desk.image ? (
              <div className={`${styles.visual} ${styles.photo}`}>
                <Image src={desk.image} alt="" fill sizes="(min-width: 1200px) 384px, 100vw" className={styles.photoImg} />
              </div>
            ) : (
              <Placeholder label="[DESK VISUAL]" className={styles.visual} />
            )}
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <h2>{desk.name}</h2>
                <span className={`lbl ${styles.badge}`}>
                  {desk.stage === "Trading" ? "● Trading" : "○ Research"}
                </span>
              </div>
              {desk.summary && <p>{desk.summary}</p>}
              <div className={`lbl ${styles.meta}`}>
                <span>
                  {Array.isArray(desk.head) && desk.head.length > 1 ? "Desk Heads" : "Desk Head"}:{" "}
                  {[desk.head].flat().join(" & ")}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
