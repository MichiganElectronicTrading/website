export type Track = "Trading" | "Engineering";

export type BoardMember = {
  name: string;
  role: string;
  title: string;
  education: string;
  /** Path under /public. Leave out to show the headshot placeholder. */
  photo?: string;
  linkedin: { href: string; label: string };
};

export type DeskHead = { name: string; desk: string; photo?: string };

export type Member = { name: string; track: Track; desk: string; photo?: string };

export const board: BoardMember[] = [
  {
    name: "David Smith",
    role: "Director of Trading",
    title: "Founding Partner",
    education: "B.S.E. Computer Science · 2029",
    photo: "/headshot-david-smith.jpg",
    linkedin: { href: "https://www.linkedin.com/in/-davidjamessmith", label: "LinkedIn →" },
  },
  {
    name: "[Name]",
    role: "Director of Engineering",
    title: "Founding Partner",
    education: "[Year · major]",
    linkedin: { href: "#", label: "[LinkedIn →]" },
  },
  {
    name: "[Name]",
    role: "Director of Technology",
    title: "Founding Partner",
    education: "[Year · major]",
    linkedin: { href: "#", label: "[LinkedIn →]" },
  },
];

export const deskHeads: DeskHead[] = Array.from({ length: 4 }, () => ({
  name: "[Name]",
  desk: "[Desk name]",
}));

const tracks: Track[] = [
  "Trading", "Engineering", "Trading", "Engineering", "Engineering", "Trading",
  "Trading", "Engineering", "Trading", "Engineering", "Trading", "Engineering",
];

export const members: Member[] = tracks.map((track) => ({
  name: "[Name]",
  track,
  desk: "[Desk name]",
}));
