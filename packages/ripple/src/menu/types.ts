/** Menu System Types */

/** What the user currently sees */
export interface View {
  degree: number;
  node?: string;
  full?: Full;
  profile?: boolean;
}

/** Full view data */
export interface Full {
  author?: string;
  type?: string;
  isMe?: boolean;
}

/** Single action */
export interface Act {
  name: string;
  icon: string;
  label: string;
  sub?: Act[];
}

/** Actions to display */
export interface Acts {
  left: Act | null;
  main: Act;
  right: Act | null;
}

/** Action picker */
export interface Pick {
  name: string;
  match: (view: View) => boolean;
  acts: (view: View, get: (name: string) => Act) => Acts;
}
