export type Guide = {
  slug: string;
  title: string;
  metaDescription: string;
  cluster: string;
  role: "PILLAR" | "SUB_PILLAR" | "LONG_TAIL";
  updatedDate: string;
  content: string;
};

export const guides: Guide[] = [
  {
    slug: "vanity-plate-rules-by-state",
    title: "Personalized License Plate Rules by State",
    metaDescription:
      "Character limits, fees, and approval rules for personalized license plates in West Virginia, Kansas, North Dakota, Tennessee, Maine, Ohio, Kentucky, and Wyoming.",
    cluster: "state-vanity-plate-rules",
    role: "PILLAR",
    updatedDate: "2026-08-16",
    content: `A personalized license plate (also called a vanity plate) lets you replace the random letters and numbers on a standard plate with your own combination — a name, a word, or an inside joke — for an extra fee on top of normal registration. Every state sets its own character limit, price, and list of what's allowed, so a combination that's fine in one state can be rejected in another.

## What Is a Personalized License Plate?

A personalized plate is a standard-issue plate design with a custom character combination instead of a randomly assigned one. You're not choosing a new plate style — the background, colors, and graphics stay whatever your state's regular plate looks like (or whatever specialty plate you've picked, if your state allows stacking personalization on top of a specialty design). What changes is the text: 5 to 8 characters, depending on the state, that you choose yourself, subject to that state's rules on what's allowed.

Every state runs its own application and approval process, usually through the DMV or a state revenue department. Most now let you check availability online before you apply, so you're not paying a fee only to find out your first choice is already registered to someone else.

## Personalized vs. Standard Plates

| | Standard plate | Personalized plate |
|---|---|---|
| Characters | Randomly assigned by the state | Your choice, within state character rules |
| Cost | Included in registration | Registration + a personalization fee (often $25–$50, plus an annual renewal fee in some states) |
| Availability | Always available (system assigns the next one) | First-come, first-served — someone else may already have your combination |
| Approval | Automatic | Reviewed against a banned-word/pattern list before approval |
| Processing time | Immediate | Days to a few weeks in most states |

## Why the Rules Vary So Much

Every state runs its own vehicle registration system, so there's no national standard for personalized plates — each DMV or revenue department sets its own character limit, fee, and content rules independently. That's why a 7-character plate is standard in Kentucky and Ohio but Wyoming caps out at 5. It's also why one state's rejection list bans anything that could resemble a phone number or address, while another focuses mainly on profanity and drug references.

The practical effect: you can't assume your ideal plate works the same way everywhere. If you're moving states, or checking what's possible before you register a new vehicle, look up the specific state's rules rather than going by what a friend in another state was able to get.

## The General Rules Every State Shares

A few things hold true almost everywhere, even though the specifics differ state to state:

1. **There's a maximum character count**, usually 6–8 characters including letters, numbers, and any allowed spaces or symbols. Going over the limit isn't negotiable — the system won't accept the combination.
2. **You'll pay more than a standard plate.** Expect a one-time or annual personalization fee on top of normal registration, typically in the $25–$50 range depending on the state.
3. **Combinations are reviewed before approval.** States maintain banned-word and banned-pattern lists — profanity, slurs, references to illegal activity, and anything that could be mistaken for an official government code are the most common categories every state rejects.
4. **Availability is first-come, first-served.** If someone else already has your exact combination, you can't get it — check availability before you commit to an idea.
5. **Processing isn't instant.** Even after a combination passes the availability check, most states take anywhere from a few days to a few weeks to print and mail the plate.

## State-by-State Rules

### Ohio

Ohio allows up to 7 characters — letters and numbers only, no spaces or hyphens. The personalization fee is $50, plus another $50 each year to keep the personalized combination active on renewal. [Check the official Ohio BMV site](https://bmvonline.dps.ohio.gov/bmvonline/oplates/specializedplates/1) for the current fee schedule before you apply.

Read the full guide: [Ohio Vanity Plate Rules](/guides/ohio-vanity-plate-rules).

### Kentucky

Kentucky allows up to 7 characters, and — unlike Ohio — permits one space or one hyphen as part of the combination (not both, and not more than one). The personalized plate fee is $25, added to your regular registration cost. The letters I, Q, and U are excluded from Kentucky's personalized combinations entirely, a rule specific to this state. [Check the official Kentucky DRIVE site](https://secure.kentucky.gov/kytc/plates/web) for current fees.

Read the full guide: [Kentucky Vanity Plate Rules](/guides/kentucky-vanity-plate-rules).

### West Virginia, Kansas, North Dakota, Tennessee, Maine, and Wyoming

Detailed state-by-state guides for West Virginia, Kansas, North Dakota, Tennessee, Maine, and Wyoming are in progress. In the meantime, you can check live availability for any of these states — along with Ohio and Kentucky — using the [personalized plate finder](/) on this site, which checks directly against the official state system rather than a cached list.

## Common Mistakes When Choosing a Personalized Plate

1. **Assuming a plate is available because it "sounds obscure."** Popular short combinations (initials plus a birth year, common nicknames) get claimed constantly. Always check first.
2. **Not accounting for the character limit until the application stage.** Sketch out your idea against the actual limit for your state before you get attached to it — a great 8-character idea doesn't fit a 5-character state.
3. **Forgetting the plate has to be read by a human, fast.** DMV reviewers reject combinations that could be misread as something else, even unintentionally. If a combination is ambiguous, expect it to get flagged.
4. **Not budgeting for the renewal fee.** Several states, including Ohio, charge the personalization fee again every year, not just once at registration.
5. **Applying without checking availability first.** A rejected or already-taken application still costs you the time of resubmitting, and sometimes a resubmission fee.

## FAQs

### How much does a personalized license plate cost?

It depends on the state — typically $25 to $50 for the personalization itself, on top of your normal vehicle registration. Some states also charge that fee again every year at renewal; others charge it once.

### Can I use spaces or symbols in a personalized plate?

Sometimes. It varies by state — Kentucky allows one space or one hyphen, Ohio allows neither. Check your specific state's rules before deciding on a combination that relies on a space or symbol.

### How long does it take to get a personalized plate?

Once your application and combination are approved, most states take anywhere from a few days to a few weeks to produce and mail the plate. Timelines aren't usually guaranteed, so don't count on having it by a specific date unless your state's DMV confirms one.

### What happens if my first choice is already taken?

You'll need to pick a different combination. Checking availability before you apply — rather than finding out after paying a fee — saves you a resubmission.

## Next Step

If you already know which state you're registering in, check your exact combination against the live state system with the [plate finder](/) before you apply — it's faster than guessing and resubmitting.`,
  },
  {
    slug: "ohio-vanity-plate-rules",
    title: "Ohio Vanity Plate Rules: Cost, Character Limit, and How to Apply",
    metaDescription:
      "Ohio personalized license plate rules: 7-character limit, $50 fee plus $50 annual renewal, letters/numbers only, and how to check availability.",
    cluster: "state-vanity-plate-rules",
    role: "SUB_PILLAR",
    updatedDate: "2026-08-16",
    content: `Ohio personalized plates allow up to 7 characters, letters and numbers only, for a $50 fee plus another $50 each year to keep the combination active.

## Character Rules

Ohio's personalized plates accept **letters and numbers only** — no spaces, no hyphens, no other symbols. The maximum length is **7 characters**. There's no separate minimum beyond having at least one character, but very short combinations (1–2 characters) are almost always already taken.

Ohio also maintains a standard content review — combinations flagged as profane, referencing illegal activity, or resembling an official government plate format get rejected during processing, not after the plate is printed.

## Cost

The personalization fee is **$50**, and Ohio charges it again — another $50 — every year you renew the plate, not just once at initial registration. Budget for this as an ongoing cost, not a one-time purchase. [Check the official Ohio BMV site](https://bmvonline.dps.ohio.gov/bmvonline/oplates/specializedplates/1) for the current fee schedule, since DMV fees do change.

## How to Check Availability

Ohio's BMV runs a live availability lookup for personalized combinations. You can check a specific combination directly against Ohio's system using the [plate finder](/results?state=OH) on this site — it queries Ohio's own database in real time, so you'll know before you apply whether your combination is already taken.

## How to Apply

Ohio personalized plates are requested through the BMV — either online through the BMV's own portal or in person at a deputy registrar agency. You'll need your vehicle registration information and the confirmed-available combination on hand.

## Common Rejections in Ohio

Beyond the standard profanity and illegal-activity restrictions every state applies, Ohio reviewers reject combinations that could be confused with an official plate series (certain letter-number patterns reserved for government or dealer plates) and anything that reads as a phone number or address when displayed on a plate.

## Next Step

Check your exact combination against Ohio's live system with the [plate finder](/results?state=OH), or go back to the [full state-by-state guide](/guides/vanity-plate-rules-by-state) to compare Ohio's rules against other states.`,
  },
  {
    slug: "kentucky-vanity-plate-rules",
    title: "Kentucky Vanity Plate Rules: Cost, Character Limit, and How to Apply",
    metaDescription:
      "Kentucky personalized license plate rules: 7-character limit, one space or hyphen allowed, $25 fee, and the letters excluded from every combination.",
    cluster: "state-vanity-plate-rules",
    role: "SUB_PILLAR",
    updatedDate: "2026-08-16",
    content: `Kentucky personalized plates allow up to 7 characters, with one space or hyphen permitted, for a $25 fee added to standard registration.

## Character Rules

Kentucky allows **up to 7 characters** — letters, numbers, and **one** space or hyphen (not both in the same combination, and never more than one). Three letters are excluded from every Kentucky personalized combination: **I, Q, and U** — a rule specific to this state, so a combination that would work elsewhere may not be valid in Kentucky simply because it contains one of those letters.

Kentucky also blocks combinations that read as all-zero-adjacent patterns and a handful of reserved letter/number sequences tied to its "Zero's temporarily unavailable" restriction on certain plate designs — if your combination gets rejected without an obvious profanity or content reason, this is often why.

## Cost

The personalization fee is **$25**, added on top of your regular vehicle registration cost. [Check the official Kentucky DRIVE site](https://secure.kentucky.gov/kytc/plates/web) for the current fee schedule.

## How to Check Availability

Kentucky's transportation cabinet runs a live personalized-plate lookup tool. You can check a specific combination directly against Kentucky's own system using the [plate finder](/results?state=KY) on this site.

## How to Apply

Kentucky personalized plates are requested through the state's DRIVE portal or your local county clerk's office. Confirm your combination is available first — Kentucky's system will reject an application for a combination that's already registered, and you'll need to resubmit with a new choice.

## Common Rejections in Kentucky

Beyond standard profanity and illegal-content restrictions, the most common Kentucky-specific rejection reason is a combination containing I, Q, or U — since those letters are excluded outright, not just discouraged. Double-check your idea against this before applying.

## Next Step

Check your exact combination against Kentucky's live system with the [plate finder](/results?state=KY), or go back to the [full state-by-state guide](/guides/vanity-plate-rules-by-state) to compare Kentucky's rules against other states.`,
  },
];
