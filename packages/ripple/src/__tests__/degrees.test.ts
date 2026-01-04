/**
 * Tests for Degree Configuration System
 *
 * The "Five Degrees of Visibility" is a core concept in Ripple:
 * - 0: Me - Personal content
 * - 1: Friends - Direct connections
 * - 2: World - Friends of friends
 * - 3: Discover - Algorithmic recommendations
 * - 4: Noise - Unfiltered/filtered content
 */

import {
  degrees,
  getDegree,
  getPath,
  getName,
  list,
  type DegreeId,
  type DegreeConfig,
} from '../config/degrees';

describe('degrees', () => {
  it('exports all five degree configurations', () => {
    expect(Object.keys(degrees)).toHaveLength(5);
    expect(degrees[0]).toBeDefined();
    expect(degrees[1]).toBeDefined();
    expect(degrees[2]).toBeDefined();
    expect(degrees[3]).toBeDefined();
    expect(degrees[4]).toBeDefined();
  });

  describe('Degree 0 - Me', () => {
    const me = degrees[0];

    it('has correct name', () => {
      expect(me.name).toBe('Me');
    });

    it('has correct path', () => {
      expect(me.path).toBe('me/posts');
    });

    it('has correct icon', () => {
      expect(me.icon).toBe('person');
    });

    it('has a description', () => {
      expect(me.description).toBeTruthy();
      expect(typeof me.description).toBe('string');
    });
  });

  describe('Degree 1 - Friends', () => {
    const friends = degrees[1];

    it('has correct name', () => {
      expect(friends.name).toBe('Friends');
    });

    it('has correct path for friends feed', () => {
      expect(friends.path).toBe('feeds/friends');
    });

    it('has people icon', () => {
      expect(friends.icon).toBe('people');
    });
  });

  describe('Degree 2 - World', () => {
    const world = degrees[2];

    it('has correct name', () => {
      expect(world.name).toBe('World');
    });

    it('has correct path', () => {
      expect(world.path).toBe('feeds/world');
    });

    it('has globe icon', () => {
      expect(world.icon).toBe('globe');
    });
  });

  describe('Degree 3 - Discover', () => {
    const discover = degrees[3];

    it('has correct name', () => {
      expect(discover.name).toBe('Discover');
    });

    it('has correct path', () => {
      expect(discover.path).toBe('feeds/discover');
    });

    it('has compass icon', () => {
      expect(discover.icon).toBe('compass');
    });
  });

  describe('Degree 4 - Noise', () => {
    const noise = degrees[4];

    it('has correct name', () => {
      expect(noise.name).toBe('Noise');
    });

    it('has correct path', () => {
      expect(noise.path).toBe('feeds/noise');
    });

    it('has volume-mute icon', () => {
      expect(noise.icon).toBe('volume-mute');
    });
  });

  it('all degrees have required properties', () => {
    Object.values(degrees).forEach((degree) => {
      expect(degree).toHaveProperty('name');
      expect(degree).toHaveProperty('path');
      expect(degree).toHaveProperty('icon');
      expect(degree).toHaveProperty('description');
    });
  });
});

describe('getDegree', () => {
  it('returns correct config for each degree ID', () => {
    expect(getDegree(0)).toBe(degrees[0]);
    expect(getDegree(1)).toBe(degrees[1]);
    expect(getDegree(2)).toBe(degrees[2]);
    expect(getDegree(3)).toBe(degrees[3]);
    expect(getDegree(4)).toBe(degrees[4]);
  });

  it('returns config with all expected properties', () => {
    const config = getDegree(0);

    expect(config.name).toBe('Me');
    expect(config.path).toBe('me/posts');
    expect(config.icon).toBe('person');
    expect(typeof config.description).toBe('string');
  });
});

describe('getPath', () => {
  it('returns correct path for each degree', () => {
    expect(getPath(0)).toBe('me/posts');
    expect(getPath(1)).toBe('feeds/friends');
    expect(getPath(2)).toBe('feeds/world');
    expect(getPath(3)).toBe('feeds/discover');
    expect(getPath(4)).toBe('feeds/noise');
  });

  it('all feed paths start with correct prefix', () => {
    expect(getPath(0)).toContain('me/');
    expect(getPath(1)).toContain('feeds/');
    expect(getPath(2)).toContain('feeds/');
    expect(getPath(3)).toContain('feeds/');
    expect(getPath(4)).toContain('feeds/');
  });
});

describe('getName', () => {
  it('returns correct name for each degree', () => {
    expect(getName(0)).toBe('Me');
    expect(getName(1)).toBe('Friends');
    expect(getName(2)).toBe('World');
    expect(getName(3)).toBe('Discover');
    expect(getName(4)).toBe('Noise');
  });

  it('all names are non-empty strings', () => {
    for (let i = 0; i <= 4; i++) {
      const name = getName(i as DegreeId);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

describe('list', () => {
  it('returns array with all five degrees', () => {
    const allDegrees = list();
    expect(allDegrees).toHaveLength(5);
  });

  it('each item includes id property', () => {
    const allDegrees = list();

    allDegrees.forEach((degree) => {
      expect(degree).toHaveProperty('id');
      expect(typeof degree.id).toBe('number');
      expect(degree.id).toBeGreaterThanOrEqual(0);
      expect(degree.id).toBeLessThanOrEqual(4);
    });
  });

  it('returns degrees in order (0-4)', () => {
    const allDegrees = list();

    for (let i = 0; i < 5; i++) {
      expect(allDegrees[i].id).toBe(i);
    }
  });

  it('each item has all config properties plus id', () => {
    const allDegrees = list();

    allDegrees.forEach((degree) => {
      expect(degree).toHaveProperty('id');
      expect(degree).toHaveProperty('name');
      expect(degree).toHaveProperty('path');
      expect(degree).toHaveProperty('icon');
      expect(degree).toHaveProperty('description');
    });
  });

  it('maintains consistency with getDegree', () => {
    const allDegrees = list();

    allDegrees.forEach((degree) => {
      const config = getDegree(degree.id);
      expect(degree.name).toBe(config.name);
      expect(degree.path).toBe(config.path);
      expect(degree.icon).toBe(config.icon);
    });
  });
});

describe('Type Safety', () => {
  it('DegreeId is constrained to 0-4', () => {
    // These should all be valid DegreeId values
    const validIds: DegreeId[] = [0, 1, 2, 3, 4];

    validIds.forEach((id) => {
      expect(getDegree(id)).toBeDefined();
    });
  });

  it('getDegree returns DegreeConfig type', () => {
    const config: DegreeConfig = getDegree(0);

    // Type assertions that would fail at compile time if types are wrong
    expect(typeof config.name).toBe('string');
    expect(typeof config.path).toBe('string');
    expect(typeof config.icon).toBe('string');
    expect(typeof config.description).toBe('string');
  });
});
