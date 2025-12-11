/**
 * THE view properties
 */
export interface TheViewProps {
  /** View name/identifier */
  name?: string;
  /** Text content (string) or background color [r,g,b,a] where values are 0-1 */
  fill?: string | [number, number, number, number?];
  /** Size [[width, unit], [height, unit]] where unit is '~'=em, '.'=px, '%'=% */
  size?: [[number, string?, number?, string?]?, [number, string?, number?, string?]?];
  /** Flow direction [horizontal, vertical] where h='>'|'<', v='v'|'^' */
  flow?: [string?, string?];
  /** Drip alignment: 0=center, 1=start, -1=end */
  drip?: number;
  /** Translation [x, y, z] in em units */
  grab?: [number?, number?, number?];
  /** Rotation [z, x, y] in turns (0-1 = 0-360deg) */
  turn?: [number?, number?, number?];
  /** Scale [x, y, z] */
  zoom?: [number?, number?, number?];
  /** Transition duration in seconds */
  time?: number;
  /** Vertical alignment offset */
  away?: [number, string?];
  /** Custom HTML tag */
  html?: string;
  /** Child views */
  children?: TheViewProps[];
}

/**
 * THE view node with place() chainable API
 */
export interface TheView extends TheViewProps {
  /** Place this view - returns chainable API */
  place: ThePlaceAPI;
}

/**
 * Chainable placement API
 */
export interface ThePlaceAPI {
  /** Place into parent (at end) */
  into(parent?: TheView): TheView;
  /** Place at beginning of parent */
  begin(parent?: TheView): TheView;
  /** Place after sibling */
  after(sibling: TheView): TheView;
  /** Place before sibling */
  before(sibling: TheView): TheView;
}

/**
 * THE runtime instance
 */
export interface TheInstance {
  /** View accessor/creator with Proxy for property assignment */
  view: ((props?: TheViewProps) => TheView) & TheViewProps & {
    place: (what: TheViewProps | string) => ThePlaceAPI;
  };
  /** Flush changes and wait for next frame */
  breathe(): Promise<void>;
  /** Keyboard state */
  key: Record<string, boolean>;
  /** Pointer/aim state */
  aim: { x: number; y: number; z: number; at: string };
  /** Event handlers */
  on: Record<string, Function>;
  /** Player state */
  player: Record<string, any>;
  /** Unit conversion ratios */
  unit: { cs: number; ps: number };
}

/**
 * THE app function type
 */
export type TheApp = (the: TheInstance) => void | Promise<void>;

/**
 * The - Main component that runs a THE app
 * @param props.app - THE app function that receives the runtime instance
 */
export function The(props: { app: TheApp }): any;
