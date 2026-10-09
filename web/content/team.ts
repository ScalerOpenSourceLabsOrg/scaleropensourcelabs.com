// THE TEAM — who actually runs the club.
//
// This list used to be org structure and NOTHING else — a team entry claimed only
// the office, on the grounds that a mentor's entry is backed by a public artifact
// and an officer's is backed by holding the office. That rule has been relaxed
// deliberately, so the reasoning that replaced it is worth writing down:
//
//   A `remit` says what the office covers, and stays true across a handover.
//   A `highlights` list says what the PERSON has done, and does not.
//
// Both now render, and the second one is the one to be careful with. These are
// claims about named students, so the file's own rule still binds them: if you
// cannot open a URL that proves it, it does not go in, and nothing goes in without
// that person's say-so. A batch year and an internship are checkable; a superlative
// is not. When somebody hands over, their highlights leave with them — only the
// remit is inherited by whoever takes the office.
//
// Three tiers, because the club genuinely has three: the two officers, the three
// functional leads, and the tier attached to them. A shadow is an understudy tied
// to one specific role who is being trained to take it over at handover — which is
// the only reason a student club survives its founders graduating, and therefore
// worth showing on the chart rather than hiding in a handbook. An aide sits in the
// same tier and is drawn the same way, but is not in line for the office: they work
// to it. The designation on the card is what separates them, so it is the word the
// key explains — do not flatten the two into one title for tidiness.
//
// Plus the desks (TEAM_CONTENT, at the bottom of this section): several people
// doing one job together under a lead, which is a different shape from both a tier
// and a shadow and gets its own type rather than being flattened into either.
//
// `shadowOf` holds the DESIGNATION, not the person. Roles outlast the people in
// them, as this term's restructure demonstrated: the president's office changed
// hands and not one line of this file had to be re-pointed at a new name.
// Team.tsx resolves it against the tier above and positions the card in that
// role's column, so a typo here surfaces as a missing connector rather than a
// silently wrong one.

/**
 * One line of a person's own record, as it appears in the hover card.
 *
 * SPLIT INTO TWO FIELDS RATHER THAN PARSED OUT OF ONE, and that is a bug fix
 * rather than a preference. These lines arrive written as "🚀 Role @ Place - what
 * it involved", so splitting on " - " to find the emphasis is the obvious move and
 * it is wrong: one of the lines below is a sentence that legitimately contains a
 * spaced hyphen ("I don't just want to learn things - I want to understand…"), and
 * a parser would have set half of it in bold. Structure that the renderer needs is
 * stated here instead of guessed there.
 *
 * The leading emoji is part of `headline` on purpose — it is this list's bullet, so
 * the rendered list carries no marker of its own.
 */
export type Highlight = {
  /** The claim. Carries the emoji, and is the emphasised half of the line. */
  headline: string;
  /** What it involved, if the line has a second half. */
  detail?: string;
};

export type TeamMember = {
  name: string;
  /** The office, not a description of the person. Rendered above the name. */
  designation: string;
  /**
   * Graduating batch, written as it is said out loud: "'28".
   *
   * Optional, and left off rather than guessed. It is the one fact on the card a
   * reader uses to place everybody else — "a second-year runs the repo" is the
   * whole point of the page — so an approximate one is worse than none.
   */
  batch?: string;
  /**
   * This person's own record. Rendered under the remit in the hover card, and as a
   * list in the stacked one.
   *
   * OPTIONAL, AND ASYMMETRY HERE IS FINE. Six of the eleven people on this chart
   * have no highlights and are not diminished by it: the remit above still answers
   * the question the page exists to answer. Filling these in for the sake of
   * evenness is how the list stops being checkable.
   */
  highlights?: Highlight[];
  /**
   * WHAT THE OFFICE COVERS, AND THEREFORE WHAT TO BRING THIS PERSON. Shown on
   * hover over the portrait on the chart, and as plain text in the stacked list.
   *
   * REQUIRED, and a remit rather than a bio, which is the whole reason this field
   * can exist in a file whose rule is that a team entry claims nothing except the
   * office. "Owns the review queue" is checkable by anyone who opens a PR;
   * "passionate about open source" is not, and it is the sentence this field would
   * turn into the moment it became optional and somebody filled one in for
   * flavour. Write it as an answer to "should I ask them?" — the question the
   * whole team section exists to answer.
   *
   * No pronouns: these get reworded at handover, not rewritten, and a role
   * description that has to be re-gendered when the office changes hands is a
   * description of a person wearing a role's name.
   */
  remit: string;
  /** Square crop — the frame is a circle. See public/people/README.md. */
  photo?: string;
  github?: string;
  /**
   * Designation of the role this person is attached to. Tier 3 only — shadows and
   * aides both, since both hang off a role rather than holding one. Which of the
   * two it is comes from `designation`, not from this field.
   */
  shadowOf?: string;
};

/** Tier 1. The two officers. */
export const TEAM_OFFICERS: TeamMember[] = [
  {
    /* Moved up from Mentorship Lead when the office fell vacant mid-term. The
       remit below is the one that came with the office, word for word — it
       describes the job rather than the holder, which is the whole reason it
       survives a handover untouched. The highlights are their own and travelled
       with them, which is the same rule read the other way round. */
    name: "Prateek Singh",
    designation: "President",
    batch: "'28",
    photo: "/people/prateek-singh.jpg",
    remit:
      "Sets direction and owns whatever nobody else does. Bring partnerships, approvals and big calls.",
    highlights: [
      {
        headline: "🚀 SDE Intern @ Scaler AI Labs",
        detail: "Building and shipping engineering solutions",
      },
      {
        // The one claim on this chart that PROJECTS already carries a figure for —
        // the OWASP/OpenCRE entry at the top of this file, read from the GitHub API
        // rather than estimated. Keep the two in step if either is reworded.
        headline: "💻 GSoC '26 Contributor @ OWASP",
        detail: "Ranked #2 contributor out of 40 in project repo",
      },
      {
        headline: "💡 Core Member & Lead Mentor @ Open Source Club",
        detail: "Mentoring builders & helping developers raise their first PR",
      },
    ],
  },
  {
    name: "Rushab Mistry",
    designation: "Vice President",
    batch: "'27",
    /* 218px square, not the 448 the README asks for, and that is the source's
       ceiling rather than an oversight: the original is a wide shot of a corridor
       in which the face occupies about 200px of a 1024x1280 frame. Upscaling to 448
       would add bytes and no detail. It clears the 112px circle it renders in, but
       a closer photograph would render visibly sharper on a 2x screen. */
    photo: "/people/rushab-mistry.jpg",
    remit:
      "Keeps the week moving. Bring a stalled plan, or anything where it's unclear whose call it is.",
    highlights: [
      {
        headline: "🌐 Protocol Labs Dev Guild",
        detail:
          "Selected for a competitive Web3 open-source program, building decentralized infrastructure with a ₹1L+/month stipend",
      },
      {
        headline: "⚡ Juspay Bounty Winner",
        detail:
          "Cleared a competitive open-source bounty during freshman year, shipping high-impact code",
      },
      {
        headline: "🛠️ Web3 & Full-Stack Engineer",
        detail:
          "Multi-disciplinary experience across blockchain development, open-source software, and freelance client systems",
      },
    ],
  },
];

/** Tier 2. Functional leads. Order is left-to-right on the chart, not a ranking. */
export const TEAM_LEADS: TeamMember[] = [
  {
    /* The office inherits its remit and nothing else. No batch, no photo, no
       highlights: none have been supplied yet, and this section's rule is that an
       unchecked fact is left off rather than guessed at. Portrait draws a monogram
       until a photograph arrives, so the chart is complete without one. */
    name: "Kumar Amityush",
    designation: "Mentorship Lead",
    remit:
      "Pairs newcomers with someone a term ahead. Bring a programme goal, or a stack you want a mentor in.",
  },
  {
    name: "Bhumi N Deshpande",
    designation: "Repo Maintainer",
    batch: "'29",
    photo: "/people/bhumi-n-deshpande.jpg",
    remit:
      "Owns the repos and the review queue. Bring a PR that needs eyes, or a branch that won't build.",
    highlights: [
      {
        headline: "🚀 MTS Intern @ Scaler AI Labs",
        detail:
          "Cracked a technical internship at Scaler AI Labs during my first year, gaining hands-on experience in a professional engineering environment.",
      },
      {
        headline: "💻 Open Source Contributor",
        detail:
          "Contributor @ Sugar Labs (Music Blocks), explored programmes like Outreachy, GSoC and DMP.",
      },
      {
        headline: "🌐 Top 1000 Global Rank",
        detail: "GSSoC '26 Contributor & #1 ranked contributor from SST",
      },
      {
        headline: "💡 Open Source Community Leader",
        detail:
          "Core Member, mentoring student developers and driving campus projects",
      },
    ],
  },
  {
    name: "Kunal Kumar",
    designation: "Events Lead",
    batch: "'28",
    photo: "/people/kunal-kumar.jpg",
    remit:
      "Runs sessions, sprints and hack nights. Bring a workshop, a talk, or an event that needs a date.",
    highlights: [
      {
        headline: "⚡ Startup Experience @ Emergent",
        detail:
          "Built real-world products using React, TypeScript, Python, and AI systems",
      },
      {
        headline: "🛠️ Creator of Recall",
        detail: "Designed and shipped AI-driven software projects from scratch",
      },
      {
        headline: "💡 Core Member @ Open Source Club (SST)",
        detail:
          "Driving technical initiatives, community growth, and student mentorship",
      },
    ],
  },
];

/* Tier 3. Each one attaches to exactly one role in a tier above.
   SHADOWS FIRST, THEN AIDES. The order places nothing — Team.tsx resolves every
   entry against the designation it names — but it IS the order the key at the foot
   of the chart glosses those designations in. Leading that key with an exception
   would read as though the exception were the rule. */
export const TEAM_SHADOWS: TeamMember[] = [
  {
    name: "Devaansh Pathak",
    designation: "Shadow",
    shadowOf: "Mentorship Lead",
    /* 440px square, cropped left of centre in a 640 square original. The original
       is already the shape this frame wants, so the crop is not about the aspect
       ratio — it is about a yellow balloon sitting at the right edge of the frame,
       at exactly the height the circle is widest. Cropping it out costs 200px of
       width and nothing else. The original is still in this directory as
       devaansh.jpeg. */
    photo: "/people/devaansh-pathak.jpg",
    remit:
      "Next Mentorship Lead, learning on the job. Ask them anything you'd ask the lead.",
    highlights: [
      {
        headline: "🚀 Founder @ Indium AI Labs",
        detail:
          "LLM agents, reinforcement learning environments, evaluation systems, AI infrastructure and the applied engineering around them",
      },
      {
        headline: "🎓 Reviewer @ NeurIPS 2026",
        detail: "On the Verify Agents workshop",
      },
      {
        /* THE ONE LINE ON THIS CHART WITH A BEFORE AND AN AFTER, and it keeps both
           figures to the decimal it was given to. Rounding it to "from 2% to 30%"
           would read as an estimate, which is the opposite of what a measured
           result is for — and the number is the claim here, not the environment. */
        headline: "📈 Built CrashDiag, an RL environment",
        detail:
          "Took Qwen 2.5 3B Instruct from 1.73% to 29.51% accuracy",
      },
      {
        headline: "☸️ Upstream Kubernetes contributor",
        detail: "Contributes to kubeflow/trainer, kubernetes and kueue",
      },
      {
        headline: "🛡️ 5+ bug bounties",
        detail: "And helped find a CVE in Nginx",
      },
      {
        /* A DOMAIN RATHER THAN A CLAIM, and the one line here that points off the
           page. It renders as text, not a link — Highlights sets plain strings —
           so it is written as a short domain somebody can read and type, and the
           detail says what is at the end of it rather than repeating the address. */
        headline: "🌐 devaanshpathak.com",
        detail: "The long version of all of the above",
      },
    ],
  },
  {
    name: "Yash Virulkar",
    designation: "Shadow",
    shadowOf: "Vice President",
    batch: "'29",
    photo: "/people/yash.jpeg",
    remit:
      "Next Vice President, learning on the job. Ask them anything you'd ask the VP.",
    // His own words, split at his own full stops. Headline-only, so the renderer
    // sets them as prose rather than as labels.
    highlights: [
      { headline: "Hey, I am Yash. I love rust and working on complex system." },
      { headline: "Currently working on mergit-io and CrownOs." },
      {
        headline:
          "I have done open source work at Openwisp, Karmada and KCL.",
      },
      { headline: "Oh yeah, I use Nix btw ❄️" },
      { headline: "1x hackathon winner" },
    ],
  },
  {
    name: "Sarvagya Sharma",
    designation: "Shadow",
    shadowOf: "Events Lead",
    batch: "'29",
    /* 280px square, not the 448 the README asks for, and the source's ceiling
       rather than an oversight: the original is an 896x1195 phone portrait of a
       whole person sitting on a drum at an event, in which the face spans about
       90px. Any crop wide enough to reach 448 has the head reading as a dot in a
       104px circle, and upscaling this one would add bytes and no detail. It
       clears the circle it renders in at 2x with room spare. A closer photograph
       would render visibly sharper; the original is here as sarvagya.jpeg. */
    photo: "/people/sarvagya-sharma.jpg",
    remit:
      "Next Events Lead, learning on the job. Ask them anything you'd ask the lead.",
    /* THE SUMMARY LINE THAT CAME WITH THESE IS NOT HERE. "AI/ML enthusiast and
       open-source contributor" is the sentence the three below are the evidence
       for, and this file's rule is that a highlight is checkable — an internship
       and a merged scikit-learn feature are, an enthusiasm is not. The last line
       stays because it is a fact about somebody's weekends rather than a claim
       about their work. */
    highlights: [
      {
        headline: "⚙️ CFD Engineer Intern @ OpenCFD Ltd",
        detail:
          "Built AI agents inside a computational fluid dynamics context",
      },
      {
        headline: "☸️ Open source contributor",
        detail:
          "Kubernetes, HAMi-dev and Volcano, working on GPU clustering",
      },
      {
        headline: "🔬 Shipped a feature to scikit-learn",
        detail: "Built it and landed it upstream",
      },
      {
        headline: "🏔️ Traveller, trekker and adventure sports",
        detail:
          "The same curiosity and drive in the mountains as in the code",
      },
    ],
  },
  {
    /* Was an aide to this office; now in line for it. Only the designation and the
       remit changed — the highlights were never about the job. */
    name: "Arnav Singh",
    designation: "Shadow",
    shadowOf: "Repo Maintainer",
    batch: "'29",
    photo: "/people/arnav-singh.jpg",
    remit:
      "Next Repo Maintainer, learning on the job. Ask them anything you'd ask the maintainer.",
    // Headline-only, every one of them. These are counts and titles rather than
    // "role, and what it involved", so there is no second half to set — and adding
    // one would mean writing it rather than recording it.
    highlights: [
      { headline: "🏆 10+ Hackathon Participations" },
      { headline: "🥇 4+ Hackathon Wins" },
      { headline: "🎮 2× National Game Dev Champion" },
      {
        headline: "☁️ Microsoft for Startups",
        detail: "Received mentorship & support",
      },
      { headline: "🎤 Hackathon Organizer & Community Lead" },
      { headline: "🌍 Country Lead — DevRel at Devnovate" },
    ],
  },
];

/* Tier 3, the other kind. A DESK, not an understudy — and that difference is why
   this is a group with one remit rather than four TeamMembers with four.
   A shadow is attached to a role and is training to hold it; a desk is several
   people doing the same work together, and nobody on it holds an office. Giving
   each member a `designation` would invent four titles the club does not award,
   and giving each its own `remit` would repeat one sentence four times. So the
   remit sits on the desk, where it is true.

   Its members may still carry a batch and their own highlights, because those
   belong to the person rather than to the desk — the remit answers "what does this
   desk do", and a highlight answers "who is this". A desk member with neither is
   just a name, which is a complete entry here.

   `of` is a DESIGNATION for the same reason `shadowOf` is: the desk reports to the
   Repo Maintainer's office, not to whoever currently holds it. Team.tsx resolves
   it against the leads and drops the connector from that column. */
/** A person on a desk. No office, so no designation; everything else is optional. */
export type GroupMember = {
  name: string;
  photo?: string;
  github?: string;
  batch?: string;
  highlights?: Highlight[];
};

export type TeamGroup = {
  /** Rendered as the label the connector from the lead reaches. */
  label: string;
  /** Designation of the role this desk reports to. */
  of: string;
  /** What the desk covers, and therefore what to bring it. One remit, one desk. */
  remit: string;
  members: GroupMember[];
};

export const TEAM_CONTENT: TeamGroup = {
  label: "Content Team",
  of: "Repo Maintainer",
  remit:
    "Writes the words — docs, READMEs, write-ups and this site. Bring a README nobody can follow.",
  members: [
    {
      name: "Divyanshi Saini",
      batch: "'29",
      /* 336px square rather than the README's 448, and the source's ceiling
         rather than an oversight: the original is a 720x1280 phone portrait in
         which the face spans about 165px. A wider crop has the head reading too
         small in a 72px circle, and upscaling this one would add bytes and no
         detail. Comfortably clears the 144px the desk circle needs at 2x. */
      photo: "/people/divyanshi-saini.jpg",
      highlights: [
        {
          headline: "🌏 Asian Hackathon for Green Future, Hanoi",
          detail: "Placed among the top 33 teams across Asia",
        },
        {
          headline: "🎤 Hosting and communications",
          detail: "Hosted Mr. Gaurav Bhalotia, CTO of EY",
        },
        {
          headline: "🎯 Core organising team @ Scaler Innovation Lab",
          detail:
            "Organised Daydream Hackathon, Django Day, IQOO Hackathon and mixer events",
        },
      ],
    },
    {
      name: "Sarvika Sharma",
      batch: "'29",
      /* SQUARE CROP OF THE SUPPLIED PHOTO, which arrived as a 1600x898 landscape
         frame at the desk. public/people/README.md asks for square here because the
         chart's frame is a circle and `object-fit: cover` keeps only the middle band
         — on the original that is a chin and a forehead. Cropped to 560px square
         around the face, with what headroom the source had above the hair. The
         original is still in this directory as sarvika.jpeg. */
      photo: "/people/sarvika-sharma.jpg",
      highlights: [
        {
          headline:
            "I'm Sarvika, a developer drawn to backend systems, open source, and how things work under the hood.",
          detail:
            "Always curious to explore new technologies and contribute to projects that make me a better developer.",
        },
        {
          headline: "🚀 Backend Intern @ Zopper",
          detail: "Experience working on real-world software systems",
        },
        {
          headline: "🎯 Events & Operations @ Scaler Innovation Lab",
          detail:
            "Organised hackathons and tech events, hosted guest mentors and speakers, and worked across event management and hospitality",
        },
      ],
    },
    {
      name: "Aarsheya Jasrotia",
      batch: "'29",
      photo: "/people/aarsheya-jasrotia.jpg",
      highlights: [
        {
          headline:
            "I'm Aarsheya, and I'm usually either building something, overthinking something, or doing both at once.",
        },
        {
          headline:
            "I like tech, but I also like making things that are actually fun, interesting, and sorta niche.",
        },
        {
          headline:
            "I'm curious about a lot of things, which means I'm constantly picking up some new obsession.",
        },
        {
          headline:
            "Still figuring stuff out, but having a pretty good time doing it.",
        },
      ],
    },
    {
      name: "Srishti Kumari",
      batch: "'29",
      photo: "/people/srishti-kumari.jpg",
      /* Four sentences rather than four credentials, and left exactly as written:
         this is somebody's own voice, and the punctuation is part of it. Note the
         third line — a spaced hyphen mid-sentence — which is the line that makes
         `headline` / `detail` two fields instead of one string and a split(" - ").
         Headline-only, so the renderer sets them as prose rather than as labels. */
      highlights: [
        {
          headline:
            "A curious mind with 47 tabs open - and somehow, all of them are important.",
        },
        {
          headline:
            "Coding today, chasing SOB tomorrow, and turning every random curiosity into a new mission.",
        },
        {
          headline:
            "I don't just want to learn things - I want to understand how everything works.",
        },
        {
          headline:
            "Ambitious, relentlessly curious, slightly chaotic… but definitely not built for an ordinary life.",
        },
      ],
    },
  ],
};

/**
 * Understudies only — the people on tier 3 who are in line for the office they are
 * attached to. NOT `TEAM_SHADOWS.length`: that tier also holds aides, who work to an
 * office without being next in it, so the sentence "training to take over" is true of
 * this number and false of that one.
 */
export function shadowCount(): number {
  return TEAM_SHADOWS.filter((m) => m.designation === "Shadow").length;
}

export function teamSize(): number {
  return (
    TEAM_OFFICERS.length +
    TEAM_LEADS.length +
    TEAM_SHADOWS.length +
    TEAM_CONTENT.members.length
  );
}
