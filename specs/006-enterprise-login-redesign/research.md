# Research: Enterprise Login Redesign

**Phase**: 0 — Outline & Research
**Date**: 2026-07-05

## Overview

All technical unknowns are resolved from existing project context. No NEEDS CLARIFICATION markers remain. This document confirms decisions and alternatives considered.

## 1. Framer Motion Patterns

**Decision**: Use Framer Motion for animations
**Rationale**: Already available in project dependencies (`package.json` shows `framer-motion` installed). Used in dashboard chart components. Import patterns: `import { motion, AnimatePresence } from 'framer-motion'`.

**Alternatives considered**:
- CSS animations only — sufficient for simple transitions, but Framer Motion provides better orchestration for sequential animations (login → dashboard redirect, statistics counter animation, particle effects)
- react-spring — not installed, would add another animation library

## 2. Tailwind CSS Glassmorphism Support

**Decision**: Use Tailwind CSS v3 built-in utilities for glassmorphism
**Rationale**: Tailwind CSS v3 supports `backdrop-blur-*`, `bg-opacity-*`, `bg-white/10` syntax, and `shadow-*` utilities. Glassmorphism achieved with:
```css
bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl
```

**Alternatives considered**:
- Custom CSS — possible but unnecessary; Tailwind utilities cover all needed effects
- CSS-in-JS (styled-components) — not used in project

## 3. AFP Logo

**Decision**: Create a text-based AFP logo component using SVG paths for the traditional AFP seal elements (shield, laurel wreath, three stars) in AFP Navy Blue and Gold
**Rationale**: Avoids external image dependencies, ensures crisp rendering at all sizes, matches military/government branding expectations

**Alternatives considered**:
- External PNG/SVG file — needs sourcing, potential licensing issues
- Text-only "AFP" — too minimal for government system
- Skip logo — contradicts spec requirement

## 4. Hero Statistics Animation

**Decision**: Animate counting numbers using Framer Motion's `useMotionValue` + `useTransform` or a custom `animate` function with `useSpring` for smooth easing
**Rationale**: Creates professional financial dashboard feel; already demonstrated by existing Recharts components using similar patterns

**Alternatives considered**:
- Static numbers — simpler but doesn't meet spec requirement
- react-countup — not installed; Framer Motion can handle counting animation natively

## 5. Animated Background Pattern

**Decision**: Use a CSS-based layered approach:
1. Base gradient (navy blue to dark blue)
2. CSS-generated grid overlay (repeating-linear-gradient)
3. CSS pseudo-element for Philippine flag colors (thin horizontal bands)
4. Animated floating particles via Framer Motion (small dots with random float animation)
5. Subtle animated gradient via CSS `@keyframes` on a pseudo-element

**Rationale**: Pure CSS + minimal Framer Motion particles provides rich visual effect without heavy canvas/WebGL dependencies

**Alternatives considered**:
- Three.js / WebGL — overkill for a login page background; heavy bundle cost
- Canvas-based particles — more performant for many particles but adds complexity; CSS + Framer Motion sufficient for 15-20 subtle particles
- Static image — no animation, misses spec requirement

## 6. Live Clock Implementation

**Decision**: Client-side JavaScript clock using `Intl.DateTimeFormat` with `timeZone: 'Asia/Manila'` and `useEffect` interval updates
**Rationale**: Simple, reliable, no external API needed; PHT is fixed UTC+8 with no DST

**Alternatives considered**:
- WorldTimeAPI call — adds network dependency, risk of failure on login page
- Server-rendered time — would not update in real-time on client

## 7. Responsive Breakpoint Strategy

**Decision**:
- Desktop (>=1024px): Two-column layout
- Tablet (768-1023px): Single column, hero hidden
- Mobile (<768px): Single column, optimized spacing, touch targets >=44px

**Rationale**: Standard Tailwind breakpoints; hero section hidden on tablet/mobile per spec

## 8. Dark/Light Mode

**Decision**: Support both modes using Tailwind CSS `dark:` variants and CSS variables
**Rationale**: Already configured in the project (Tailwind dark mode via class strategy). Glassmorphism effects adapt by adjusting opacity values in dark mode.

## 9. Password Strength Indicator

**Decision**: Not implemented (spec marks as optional). Basic show/hide toggle + caps lock warning included.

## 10. Forgot Password / Need Help Links

**Decision**: Navigate to placeholder modals or pages. Password reset flow is explicitly out of scope per Assumptions in spec.
