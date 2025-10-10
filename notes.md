# Ripple Implementation Notes

**Project:** Ripple - Decentralized Social Network
**Start Date:** 2025-10-10
**Timeline:** ~23 weeks (~5.5 months)

---

## Project Overview

Building a decentralized, privacy-first social networking application using:
- **Gun Database** for decentralized data storage
- **LynxJS** for cross-platform native performance
- **WebRTC** for peer-to-peer real-time communication
- **FRP patterns** inspired by Gun's architecture
- **EigenTrust-inspired** Web of Trust algorithms

**Key Phases:**
1. Phase 1: Refactor `packages/core` to FRP-style architecture (6 weeks)
2. Phase 2: Native WebRTC module implementation (4 weeks)
3. Phase 3: Web of Trust and degree separation system (5 weeks)
4. Phase 4: Ripple app development with unified feed (8 weeks)

---

## Session Log

### 2025-10-10: Project Initialization

**Context:**
- Received comprehensive RFC for Ripple implementation
- RFC outlines 4-phase approach with detailed technical specifications
- Current codebase is in `ariob` monorepo with existing Gun-based architecture

**Actions Taken:**
1. Created `todo.md` with complete task breakdown
   - Organized tasks by phase and week
   - Added success criteria checklist
   - Included continuous tasks section
   - Set up milestone tracking

2. Created `notes.md` (this file) for progress tracking
   - Session-based logging format
   - Technical decision documentation
   - Problem/solution tracking
   - Reference links

**Current Status:**
- Status: Planning Phase
- Next Steps: Begin Phase 1 Week 1 tasks
- Blockers: None currently

**Key Decisions:**
- Using RxJS for FRP implementation
- WebRTC native modules for iOS and Android
- Gun Database for signaling and data storage
- Tailwind CSS for styling
- LynxJS for cross-platform UI

**References:**
- RFC: `Building Ripple - Implementation Plan.md` (received)
- Current codebase: `/Users/aethiop/Documents/Dev/ariob/`
- Bible app: `/Users/aethiop/Documents/Dev/ariob/apps/bible`
- Core package: `/Users/aethiop/Documents/Dev/ariob/packages/core` (needs refactoring)

---

## Technical Decisions

### FRP Architecture Choice
**Date:** 2025-10-10
**Decision:** Use RxJS-based FRP pattern for core refactoring
**Rationale:**
- Gun's architecture is inherently FRP-like
- RxJS provides mature, well-tested observable implementation
- Framework-agnostic core with framework-specific hooks
- Better performance and composability than class-based approach

**Alternatives Considered:**
- Keep class-based architecture: Less flexible, harder to compose
- Use custom FRP implementation: Reinventing the wheel, more maintenance

**Implementation Notes:**
- Core logic in pure functions
- Observables for reactive data streams
- React hooks as thin wrapper over observables
- Can support other frameworks (Vue, Svelte) in future

---

### WebRTC Native Modules
**Date:** 2025-10-10
**Decision:** Implement WebRTC as native modules for iOS and Android
**Rationale:**
- Better performance than JavaScript-based WebRTC
- More reliable on mobile devices
- Access to native WebRTC frameworks
- Better battery life

**Alternatives Considered:**
- Web-based WebRTC: Less reliable on mobile, worse performance
- Third-party library: Less control, potential vendor lock-in

**Implementation Notes:**
- iOS: Using WebRTC.framework (Google's official framework)
- Android: Using WebRTC library from Google
- JavaScript API wrapper for cross-platform consistency
- Gun Database for signaling

---

### Trust System Algorithm
**Date:** 2025-10-10
**Decision:** Use EigenTrust-inspired algorithm with BFS propagation
**Rationale:**
- Proven algorithm for distributed trust
- Works well in decentralized networks
- Resistant to Sybil attacks
- Good balance of accuracy and performance

**Alternatives Considered:**
- Simple follow-based: Too simplistic, easy to game
- PageRank-style: More complex, not designed for social trust
- Machine learning: Overkill, requires training data

**Implementation Notes:**
- Direct trust: 0-1 score set by user
- Indirect trust: Propagated via network with decay
- Decay factor: 0.7 per degree (configurable)
- Max degrees: 3 for performance (configurable)
- Caching strategy for computed scores

---

## Problems & Solutions

### Problem: FRP Learning Curve
**Date:** 2025-10-10
**Status:** Anticipated
**Description:** Team may not be familiar with FRP patterns and RxJS

**Solutions:**
1. Pair programming during initial implementation
2. Code reviews with FRP focus
3. Create comprehensive documentation with examples
4. Start with simple patterns, gradually introduce complexity
5. Hybrid approach: Keep classes for very complex state if needed

**Outcome:** TBD

---

### Problem: WebRTC NAT Traversal
**Date:** 2025-10-10
**Status:** Anticipated
**Description:** Some network configurations may block P2P connections

**Solutions:**
1. Implement STUN server for public endpoint discovery
2. Implement TURN server as fallback for relaying
3. Connection retry logic with exponential backoff
4. Clear user feedback on connection status
5. Initially relay all connections through TURN if needed

**Outcome:** TBD

---

### Problem: Trust Calculation Performance
**Date:** 2025-10-10
**Status:** Anticipated
**Description:** Calculating trust for large networks could be slow

**Solutions:**
1. Aggressive caching of trust scores
2. Batch processing for multiple users
3. Background workers for computation
4. Limit degrees of separation (max 3)
5. Use simpler algorithm if performance issues persist
6. Pre-compute trust for followed users

**Outcome:** TBD

---

## Code Examples & Patterns

### FRP Stream Pattern
```typescript
// Instead of class-based:
class UserService {
  getUser() { /* imperative */ }
}

// Use streams:
const user = (pub) => gun.get('~' + pub)
const profile = (user) => user.get('profile')
const subscribe = (ref, callback) => ref.on(callback)

// Compose:
const userProfile = compose(user, profile, subscribe)
```

### Observable Wrapper
```typescript
export const stream = <T>(soul: string): Observable<T | null> => {
  return new Observable(subscriber => {
    const ref = gun.get(soul)
    const unsubscribe = ref.on((data) => {
      subscriber.next(data as T | null)
    })
    return () => {
      ref.off()
      unsubscribe()
    }
  })
}
```

### React Hook Pattern
```typescript
export const useStream = <T>(stream: Observable<T>) => {
  const [data, setData] = useState<T>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sub = stream.subscribe({
      next: value => {
        setData(value)
        setLoading(false)
      }
    })
    return () => sub.unsubscribe()
  }, [stream])

  return { data, loading }
}
```

---

## Performance Benchmarks

### Target Metrics
- Feed load time: < 2s
- Trust calculation: < 500ms for 100 users
- WebRTC connection: < 3s
- Memory usage: < 100MB base
- Battery impact: < 5% per hour active use

### Actual Metrics
_(To be filled in during implementation)_

---

## Testing Notes

### Test Coverage Goals
- Unit tests: >90% coverage
- Integration tests: All major flows
- E2E tests: All user journeys
- Performance tests: All critical paths

### Testing Strategy
1. **Unit Tests:** Pure functions, operators, utilities
2. **Integration Tests:** Gun + FRP, WebRTC + Gun, Trust + Feed
3. **E2E Tests:** Full user flows on real devices
4. **Performance Tests:** Load testing, memory profiling

---

## Dependencies

### Core Dependencies
- RxJS: ^7.8.1 (for FRP patterns)
- Gun: ^0.2020.1240 (decentralized database)
- Zod: ^3.22.4 (schema validation)

### WebRTC Dependencies
- iOS: WebRTC.framework (CocoaPods)
- Android: org.webrtc:google-webrtc

### App Dependencies
- LynxJS: (check version in package.json)
- Tailwind CSS: (for styling)

---

## Open Questions

1. **Federation Strategy:**
   - Q: Should we implement relay peers for Gun?
   - A: TBD - evaluate after Phase 1

2. **Offline Support:**
   - Q: How much data should we cache offline?
   - A: TBD - evaluate during Phase 4

3. **Moderation:**
   - Q: How to handle spam/abuse in decentralized network?
   - A: TBD - Web of Trust should help, but may need additional mechanisms

4. **Scalability:**
   - Q: What happens when users have 10k+ followers?
   - A: TBD - test during Phase 3

5. **Data Pruning:**
   - Q: How to handle growing Gun database size?
   - A: TBD - implement pruning strategy in Phase 4

---

## Resources & References

### Documentation
- [Gun Database Docs](https://gun.eco/docs/)
- [Gun FRP Patterns](https://github.com/amark/gun/wiki/FRP)
- [RxJS Documentation](https://rxjs.dev/)
- [LynxJS Guide](https://lynxjs.org/guide/)
- [WebRTC Specification](https://webrtc.org/)
- [EigenTrust Paper](http://ilpubs.stanford.edu:8090/562/)

### Example Projects
- [Notabug](https://github.com/notabugio/notabug) - Reddit-like app with Gun
- [Iris](https://github.com/irislib/iris-messenger) - Decentralized social network

### Community
- Gun Discord
- LynxJS Community
- WebRTC Community

---

## Next Actions

### Immediate Next Steps (Week 1)
1. Review current `packages/core` structure
2. Set up new directory structure for FRP refactoring
3. Add RxJS dependency
4. Create first observable wrappers for Gun
5. Write initial tests

### This Week's Focus
- Phase 1, Week 1: Setup & Foundation
- Get familiar with current codebase
- Set up development environment
- Create basic FRP utilities

### Upcoming Milestones
- **Week 6:** Phase 1 complete (FRP refactoring)
- **Week 10:** Phase 2 complete (WebRTC)
- **Week 15:** Phase 3 complete (Web of Trust)
- **Week 23:** Phase 4 complete (Ripple MVP)

---

## Change Log

### 2025-10-10
- Created project structure (`todo.md` and `notes.md`)
- Documented initial technical decisions
- Identified anticipated problems and solutions
- Set up reference documentation

---

## Team Notes

_(Space for team members to add notes, insights, and learnings)_

---

## Retrospective Notes

_(To be filled in at the end of each phase)_

### Phase 1 Retrospective
**Date:** TBD
**What went well:**
**What didn't go well:**
**What to improve:**
**Action items:**

### Phase 2 Retrospective
**Date:** TBD
**What went well:**
**What didn't go well:**
**What to improve:**
**Action items:**

### Phase 3 Retrospective
**Date:** TBD
**What went well:**
**What didn't go well:**
**What to improve:**
**Action items:**

### Phase 4 Retrospective
**Date:** TBD
**What went well:**
**What didn't go well:**
**What to improve:**
**Action items:**

---

**Note:** This is a living document. Update after each work session with:
- What was done
- What was learned
- What problems were encountered
- What decisions were made
- What's next
