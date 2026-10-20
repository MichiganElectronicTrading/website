"use client";

import { useState } from "react";
import FilterButtons from "./FilterButtons";
import Placeholder from "./Placeholder";
import { desks } from "@/data/desks";
import styles from "./DeskBoard.module.css";

const FILTERS = ["All", "Research", "Execution"] as const;

export default function DeskBoard() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = filter === "All" ? desks : desks.filter((d) => d.stage === filter);

  return (
    <>
      <FilterButtons label="Filter desks" options={FILTERS} value={filter} onChange={setFilter} />
      <div className={styles.grid}>
        {shown.map((desk, i) => (
          <article key={i} className={styles.card}>
            <Placeholder label="[DESK VISUAL]" className={styles.visual} />
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <h3>{desk.name}</h3>
                <span className={`lbl ${styles.badge}`}>
                  {desk.stage === "Execution" ? "● Execution" : "○ Research"}
                </span>
              </div>
              <p>{desk.summary}</p>
              <div className={`lbl ${styles.meta}`}>
                <span>Head: {desk.head}</span>
                <span>
                  {desk.trading} trading · {desk.eng} eng
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
