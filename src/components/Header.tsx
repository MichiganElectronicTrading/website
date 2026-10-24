"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MetMark from "./MetMark";
import { site } from "@/data/site";
import styles from "./Header.module.css";

const links = [
  { href: "/desks", label: "Desks" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/members", label: "Members" },
];

export default function Header() {
  const pathname = usePathname();
  const onJoin = pathname === "/join";

  return (
    <header className={`dark ${styles.bar}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <MetMark width={42} height={34} />
          <span className={`hf ${styles.name}`}>{site.name}</span>
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          {links.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={current ? styles.current : undefined}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/join"
            className={onJoin ? "btn fill" : "btn"}
            aria-current={onJoin ? "page" : undefined}
          >
            Join
          </Link>
        </nav>
      </div>
    </header>
  );
}
