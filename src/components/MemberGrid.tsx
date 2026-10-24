"use client";

import { useState } from "react";
import Image from "next/image";
import FilterButtons from "./FilterButtons";
import { members } from "@/data/members";
import styles from "./MemberGrid.module.css";

const FILTERS = ["All", "Trading", "Engineering"] as const;

export default function MemberGrid() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = filter === "All" ? members : members.filter((m) => m.track === filter);

  return (
    <>
      <FilterButtons label="Filter members" options={FILTERS} value={filter} onChange={setFilter} />
      <div className={styles.grid}>
        {shown.map((m, i) => (
          <article key={i} className={styles.card}>
            {m.photo && m.linkedin ? (
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener"
                className={styles.photoLink}
                aria-label={`${m.name} on LinkedIn`}
              >
                <Image src={m.photo} alt="" fill sizes="240px" className={styles.photo} />
              </a>
            ) : m.photo ? (
              <Image src={m.photo} alt="" fill sizes="240px" className={styles.photo} />
            ) : (
              <>
                <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.cross}>
                  <line x1="0" y1="0" x2="100" y2="100" stroke="#A3A29D" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="#A3A29D" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className={`lbl ${styles.photoLabel}`} aria-hidden="true">
                  [Photo]
                </span>
              </>
            )}
            <h3 className={styles.name}>{m.name}</h3>
            <div className={styles.info}>
              <span className={styles.track}>{m.track}</span>
              <span className={styles.desk}>{m.desk}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
