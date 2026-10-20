export type RecruitingStep = {
  name: string;
  date: string;
  /** Shown on the Join page Process cards. */
  description: string;
  /** Prefix the date with "Due" on Home while applications are open. */
  due?: boolean;
};

export const recruiting = {
  /** "open" or "closed". Switches Home's Join section and the Join page header. */
  status: "closed" as "open" | "closed",
  term: "Winter 2027",
  /** External form links. The site never collects data itself. */
  notifyUrl: "https://forms.gle/kD5T8UcvgUeQnxcc8",
  applyUrl: "#",
  /** Shown on Home while open. */
  closesDate: "[DATE]",
  decisionsDate: "[DATE]",
  /** Index into `steps` of the current step while open. Earlier steps show as past. */
  currentStep: 2,
  steps: [
    { name: "Winterfest", date: "[DATE]", description: "Find us at our table to meet members and ask questions." },
    { name: "Mass Meeting", date: "[DATE]", description: "Hear how MET works, what desks are building, and how to apply." },
    { name: "Application", date: "[DATE]", due: true, description: "A short written application. Pick a track and tell us what you've built." },
    { name: "Interviews", date: "[DATE]", description: "Behavioral and technical rounds. Final rounds include a live trading game." },
  ] as RecruitingStep[],
};

export const tracks = [
  {
    label: "Track A",
    name: "Trading Track",
    summary: "Research and run the strategies our desks trade.",
    lookFor: [
      "Comfort with probability and quick mental math",
      "Curiosity about how markets work",
      "Coding experience in Python or similar",
    ],
  },
  {
    label: "Track B",
    name: "Engineering Track",
    summary: "Build the software and hardware our desks run on.",
    lookFor: [
      "Strong programming, especially C++ or Python",
      "Interest in low-latency systems, FPGAs, or networking",
      "Projects you've built on your own",
    ],
  },
];

export const faq = [
  { q: "Do I need trading experience?", a: "No. New members go through a weekly education program that covers the basics." },
  { q: "Can freshmen apply?", a: "Yes. All years and majors can apply." },
  { q: "Can I apply to both tracks?", a: "Pick one when you apply. Desks mix both tracks, so you'll work with the other side either way." },
];
