export type Track = "Trading" | "Engineering";

export type BoardMember = {
  name: string;
  role: string;
  title: string;
  /** Desk this board member also heads; shown as its own "Desk Head · …" line. */
  deskHead?: string;
  education: string;
  /** Path under /public. Leave out to show the headshot placeholder. */
  photo?: string;
  linkedin: { href: string; label: string };
};

/** `linkedin` is a profile URL; when set, clicking the photo opens it. */
export type DeskHead = {
  name: string;
  desk: string;
  photo?: string;
  linkedin?: string;
};

/** `desk` is optional; members without one show just their track. */
export type Member = { name: string; track: Track; desk?: string; photo?: string; linkedin?: string };

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
    name: "Mihir Epel",
    role: "Director of Engineering",
    title: "Founding Partner",
    deskHead: "Sports Prediction",
    education: "B.S.E. Computer Engineering · 2028",
    photo: "/headshot-mihir-epel.jpg",
    linkedin: { href: "https://www.linkedin.com/in/mihirepel/", label: "LinkedIn →" },
  },
  {
    name: "Colter Gladish",
    role: "Director of Technology",
    title: "Founding Partner",
    education: "B.S. Financial Math and Computer Science · 2029",
    photo: "/headshot-colter-gladish.jpg",
    linkedin: { href: "https://www.linkedin.com/in/coltergladish/", label: "LinkedIn →" },
  },
];

export const deskHeads: DeskHead[] = [
  {
    name: "John Colyer",
    desk: "Systematic Biotech",
    photo: "/headshot-john-colyer.jpg",
    linkedin: "https://www.linkedin.com/in/john-colyer/",
  },
];

const memberList: Member[] = [
  {
    name: "Avi Goldschmidt",
    track: "Engineering",
    photo: "/headshot-avi-goldschmidt.jpg",
    linkedin: "https://www.linkedin.com/in/avi-goldschmidt/",
  },
  {
    name: "Aman Patel",
    track: "Trading",
    photo: "/headshot-aman-patel.jpg",
    linkedin: "https://www.linkedin.com/in/aman-patel-3b0b5b361/",
  },
  {
    name: "Dhruv Aron",
    track: "Engineering",
    photo: "/headshot-dhruv-aron.jpg",
    linkedin: "https://www.linkedin.com/in/dhruvaron/",
  },
  {
    name: "Kelly Bae",
    track: "Engineering",
    photo: "/headshot-kelly-bae.jpg",
    linkedin: "https://www.linkedin.com/in/kelly-bae-01bb3a43a/",
  },
  {
    name: "Santiago Caravia Perry",
    track: "Trading",
    photo: "/headshot-santiago-caravia-perry.jpg",
    linkedin: "https://www.linkedin.com/in/santiagocaravia/",
  },
  {
    name: "Sabine Castro",
    track: "Engineering",
    photo: "/headshot-sabine-castro.jpg",
    linkedin: "https://www.linkedin.com/in/sabinecastro/",
  },
];

/** Last name: everything after the first word, so "Caravia Perry" sorts under C. */
const lastName = (name: string) => name.split(" ").slice(1).join(" ");

/** General members, sorted alphabetically by last name, then first name. */
export const members: Member[] = [...memberList].sort(
  (a, b) => lastName(a.name).localeCompare(lastName(b.name)) || a.name.localeCompare(b.name),
);
