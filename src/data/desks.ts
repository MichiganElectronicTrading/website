export type DeskStage = "Research" | "Trading";

export type Stage = {
  n: string;
  name: string;
  /** Short version shown on Home. */
  summary: string;
  /** Longer version shown on the Desks page. */
  description: string;
};

export type Desk = {
  name: string;
  stage: DeskStage;
  /** One or two lines on the strategy or project. Leave out until written. */
  summary?: string;
  head: string;
  /** Card image under /public. Leave out to show the placeholder box. */
  image?: string;
};

export const stages: Stage[] = [
  {
    n: "01",
    name: "Proposal",
    summary:
      "A member pitches an idea and the students and expertise needed to build it. The board reviews each pitch and approves the desks that launch.",
    description:
      "Members pitch desks at the start of each semester. Each pitch covers the idea, what it takes to build, and who's on the team.",
  },
  {
    n: "02",
    name: "Research",
    summary:
      "The desk builds and tests its strategy without capital on the line. It moves forward once it has a working system or a proven edge.",
    description:
      "The desk builds its system and tests it with no capital at risk. It moves to execution once it has a working system or a proven edge.",
  },
  {
    n: "03",
    name: "Execution",
    summary:
      "The desk trades real capital within set risk limits. It monitors its risk in real time and scales back as it nears those limits.",
    description:
      "The desk trades club capital within set risk limits. It monitors its risk in real time and scales back as it nears those limits.",
  },
];

export const desks: Desk[] = [
  {
    name: "Sports Prediction",
    stage: "Trading",
    head: "Mihir Epel",
    image: "/desk-sports-prediction.jpg",
  },
];
