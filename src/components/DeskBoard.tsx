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
      <div className={styles.grid}>
        {shown.map((desk, i) => (
          <article key={i} className={styles.card}>
            {desk.image ? (
              <div className={`${styles.visual} ${styles.photo}`}>
                <Image src={desk.image} alt="" fill sizes="(min-width: 1200px) 384px, 100vw" className={styles.photoImg} />
              </div>
            ) : (
              <Placeholder label="[DESK VISUAL]" className={styles.visual} />
            )}
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <h3>{desk.name}</h3>
                <span className={`lbl ${styles.badge}`}>
                  {desk.stage === "Trading" ? "● Trading" : "○ Research"}
                </span>
              </div>
              {desk.summary && <p>{desk.summary}</p>}
              <div className={`lbl ${styles.meta}`}>
                <span>Desk Head: {desk.head}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
