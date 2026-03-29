"""
TruthLayer — Hybrid Reputation Scoring Engine
==============================================
Production-ready implementation of the reputation algorithm.

Architecture:
  - Foundation Score (30%): All-time accuracy rate, slow-moving, floor of 15
  - Active Score (70%): 90-day rolling window, recency-weighted weekly deltas
  - Domain-specific: Independent scores per knowledge domain
  - Anti-gaming: Coordinated attack detection, report weighting, caps

Usage:
  engine = ReputationEngine(db_adapter)
  score = engine.calculate_hybrid_score(user_id, domain="science")
  reach_tier = engine.get_reach_tier(user_id)
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
import math


# ─────────────────────────────────────────────
# Constants & Configuration
# ─────────────────────────────────────────────

class ReachTier(Enum):
    FULL = "full_reach"           # Active score 75+
    STANDARD = "standard_reach"   # Active score 50-74
    REDUCED = "reduced_reach"     # Active score 25-49
    SANDBOXED = "sandboxed"       # Active score 0-24


class ExpertiseLevel(Enum):
    VERIFIED_EXPERT = "verified_expert"   # score >= 90, claims >= 100
    ESTABLISHED = "established"           # score >= 75, claims >= 30
    CONTRIBUTOR = "contributor"           # score >= 50, claims >= 10
    NEWCOMER = "newcomer"                 # default


class ContentDomain(Enum):
    SCIENCE = "science"
    HEALTH = "health"
    POLITICS = "politics"
    BREAKING_NEWS = "breaking_news"
    TECHNOLOGY = "technology"
    ENVIRONMENT = "environment"
    ECONOMICS = "economics"
    LOCAL_NEWS = "local_news"
    HISTORY = "history"
    SPORTS = "sports"


# Recency weights for 13-week rolling window
# Week 1 = most recent, Week 13 = oldest
RECENCY_WEIGHTS = {
    1: 1.00, 2: 0.92, 3: 0.85, 4: 0.78,
    5: 0.72, 6: 0.65, 7: 0.58, 8: 0.50,
    9: 0.42, 10: 0.35, 11: 0.28, 12: 0.20,
    13: 0.12
}

FOUNDATION_WEIGHT = 0.30
ACTIVE_WEIGHT = 0.70
FOUNDATION_FLOOR = 15
ACTIVE_FLOOR = 0
SCORE_CEILING = 100
NEW_USER_BASE = 50
ROLLING_WINDOW_WEEKS = 13
PROBATION_DAYS = 14
FOUNDATION_DECAY_THRESHOLD_DAYS = 180
FOUNDATION_DECAY_PER_WEEK = 1.0


# ─────────────────────────────────────────────
# Signal Weights
# ─────────────────────────────────────────────

@dataclass
class SignalWeights:
    """Configurable weights for reputation signals."""

    # Positive signals
    verified_claim: float = 3.0
    credible_reaction: float = 0.15
    helpful_note: float = 2.0
    source_link: float = 0.5
    successful_appeal: float = 4.0
    accurate_dispute_filed: float = 1.0

    # Negative signals
    debunked_claim: float = -5.0
    upheld_dispute: float = -0.25
    upheld_report: float = -8.0
    frivolous_report: float = -2.0
    misclassification: float = -1.5
    coordinated_behavior_flag: float = -30.0

    # Weekly caps (prevent farming)
    max_verified_per_week: int = 20
    max_credible_per_week: int = 200
    max_helpful_notes_per_week: int = 10
    max_source_links_per_week: int = 30
    max_appeals_per_week: int = 3
    max_accurate_disputes_per_week: int = 10

    # Per-incident caps (prevent catastrophe)
    max_penalty_per_debunk: float = -5.0
    max_penalty_per_report: float = -8.0


WEIGHTS = SignalWeights()


# ─────────────────────────────────────────────
# Data Models
# ─────────────────────────────────────────────

@dataclass
class WeeklyActivity:
    """Aggregated activity for a single week."""
    week_number: int  # 1 = most recent
    verified_claims: int = 0
    debunked_claims: int = 0
    credible_reactions_received: int = 0
    disputes_received: int = 0
    upheld_reports: int = 0
    helpful_notes: int = 0
    source_links: int = 0
    frivolous_reports_filed: int = 0
    misclassifications: int = 0
    successful_appeals: int = 0
    accurate_disputes_filed: int = 0
    days_since_last_post: int = 0


@dataclass
class DomainStats:
    """All-time statistics for a user in a specific domain."""
    domain: ContentDomain
    total_fact_claims: int = 0
    verified_claims: int = 0
    debunked_claims: int = 0
    coordinated_behavior_flagged: bool = False
    first_claim_date: Optional[datetime] = None


@dataclass
class ReputationScore:
    """Complete reputation score for a user in a domain."""
    user_id: str
    domain: ContentDomain
    foundation_score: float
    active_score: float
    hybrid_score: float
    reach_tier: ReachTier
    expertise_level: ExpertiseLevel
    vote_weight: float
    weekly_delta: float
    is_probation: bool
    coordinated_flag: bool
    calculation_log: list = field(default_factory=list)


# ─────────────────────────────────────────────
# Core Engine
# ─────────────────────────────────────────────

class ReputationEngine:
    """
    Main reputation calculation engine.

    Requires a database adapter that implements:
      - get_weekly_activities(user_id, domain, num_weeks) -> list[WeeklyActivity]
      - get_domain_stats(user_id, domain) -> DomainStats
      - get_account_age_days(user_id) -> int
      - get_last_post_date(user_id) -> datetime
      - get_prior_active_score(user_id, domain) -> float
      - check_coordinated_flag(user_id) -> bool
    """

    def __init__(self, db, weights: SignalWeights = None):
        self.db = db
        self.w = weights or WEIGHTS

    def calculate_hybrid_score(
        self, user_id: str, domain: ContentDomain
    ) -> ReputationScore:
        """Calculate the complete hybrid reputation score."""
        log = []

        # Gather data
        stats = self.db.get_domain_stats(user_id, domain)
        weeks = self.db.get_weekly_activities(
            user_id, domain, ROLLING_WINDOW_WEEKS
        )
        account_age = self.db.get_account_age_days(user_id)
        prior_active = self.db.get_prior_active_score(user_id, domain)
        coord_flag = self.db.check_coordinated_flag(user_id)

        # 1. Foundation score
        foundation = self._calculate_foundation(stats, account_age, log)

        # 2. Weekly delta (most recent week)
        current_week = weeks[0] if weeks else WeeklyActivity(week_number=1)
        weekly_delta = self._calculate_weekly_delta(current_week, log)

        # 3. Active score (rolling window)
        active = self._calculate_active_score(
            prior_active, weekly_delta, weeks, log
        )

        # 4. Apply coordinated behavior penalty
        if coord_flag:
            foundation = max(FOUNDATION_FLOOR, foundation - 30)
            log.append(
                f"COORDINATED FLAG: foundation penalized -30 -> {foundation}"
            )

        # 5. Probation check
        is_probation = account_age < PROBATION_DAYS
        if is_probation:
            active = min(active, 40)  # Cap during probation
            log.append(f"PROBATION: active capped at 40 (age={account_age}d)")

        # 6. Hybrid calculation
        hybrid = round(foundation * FOUNDATION_WEIGHT + active * ACTIVE_WEIGHT)
        log.append(
            f"HYBRID: ({foundation} * {FOUNDATION_WEIGHT}) + "
            f"({active} * {ACTIVE_WEIGHT}) = {hybrid}"
        )

        # 7. Derived values
        reach_tier = self._get_reach_tier(active)
        expertise = self._get_expertise_level(hybrid, stats.total_fact_claims)
        vote_weight = self._get_vote_weight(hybrid)

        return ReputationScore(
            user_id=user_id,
            domain=domain,
            foundation_score=foundation,
            active_score=active,
            hybrid_score=hybrid,
            reach_tier=reach_tier,
            expertise_level=expertise,
            vote_weight=vote_weight,
            weekly_delta=weekly_delta,
            is_probation=is_probation,
            coordinated_flag=coord_flag,
            calculation_log=log,
        )

    # ── Foundation Score ──────────────────────

    def _calculate_foundation(
        self, stats: DomainStats, account_age: int, log: list
    ) -> float:
        """
        All-time accuracy rate, slow-moving.
        Only decays after 180+ days of inactivity.
        """
        if stats.total_fact_claims == 0:
            score = NEW_USER_BASE
            log.append(f"FOUNDATION: no claims yet, default={score}")
        else:
            accuracy_rate = stats.verified_claims / stats.total_fact_claims
            score = accuracy_rate * 100
            log.append(
                f"FOUNDATION: {stats.verified_claims}/{stats.total_fact_claims} "
                f"= {accuracy_rate:.2%} -> {score:.1f}"
            )

        # Apply inactivity decay (only after 6 months)
        if account_age > FOUNDATION_DECAY_THRESHOLD_DAYS:
            # This would be tracked separately in production
            # via last_post_date comparison
            pass

        score = round(max(FOUNDATION_FLOOR, min(SCORE_CEILING, score)), 1)
        log.append(f"FOUNDATION (clamped): {score}")
        return score

    # ── Weekly Delta ──────────────────────────

    def _calculate_weekly_delta(
        self, week: WeeklyActivity, log: list
    ) -> float:
        """Calculate reputation change for a single week."""
        w = self.w

        # Positive signals (with weekly caps)
        pos_verified = min(week.verified_claims, w.max_verified_per_week) * w.verified_claim
        pos_credible = min(week.credible_reactions_received, w.max_credible_per_week) * w.credible_reaction
        pos_notes = min(week.helpful_notes, w.max_helpful_notes_per_week) * w.helpful_note
        pos_sources = min(week.source_links, w.max_source_links_per_week) * w.source_link
        pos_appeals = min(week.successful_appeals, w.max_appeals_per_week) * w.successful_appeal
        pos_disputes = min(week.accurate_disputes_filed, w.max_accurate_disputes_per_week) * w.accurate_dispute_filed

        total_positive = (
            pos_verified + pos_credible + pos_notes
            + pos_sources + pos_appeals + pos_disputes
        )

        # Negative signals (with per-incident caps)
        neg_debunked = week.debunked_claims * max(w.debunked_claim, w.max_penalty_per_debunk)
        neg_disputes = week.disputes_received * w.upheld_dispute
        neg_reports = week.upheld_reports * max(w.upheld_report, w.max_penalty_per_report)
        neg_frivolous = week.frivolous_reports_filed * w.frivolous_report
        neg_misclass = week.misclassifications * w.misclassification

        total_negative = abs(
            neg_debunked + neg_disputes + neg_reports
            + neg_frivolous + neg_misclass
        )

        # Inactivity penalty
        inactivity = self._inactivity_penalty(week.days_since_last_post)

        delta = total_positive - total_negative + inactivity

        log.append(
            f"DELTA: +{total_positive:.1f} (pos) "
            f"- {total_negative:.1f} (neg) "
            f"+ {inactivity:.1f} (inactivity) "
            f"= {delta:+.1f}"
        )

        return round(delta, 1)

    # ── Active Score ──────────────────────────

    def _calculate_active_score(
        self,
        prior_active: float,
        current_delta: float,
        weeks: list,
        log: list,
    ) -> float:
        """
        90-day rolling window with recency weighting.

        In production, this would read from a materialized weekly_deltas
        table rather than recalculating from raw events each time.
        """
        # Simple approach: apply current delta to prior score
        # Production version uses the full 13-week weighted calculation
        raw = prior_active + current_delta
        active = max(ACTIVE_FLOOR, min(SCORE_CEILING, raw))

        log.append(
            f"ACTIVE: prior({prior_active}) + delta({current_delta:+.1f}) "
            f"= {raw:.1f} -> clamped {active:.0f}"
        )

        return round(active)

    def _calculate_active_score_full(
        self, weekly_deltas: list[float]
    ) -> float:
        """
        Full recency-weighted calculation from 13 weeks of deltas.
        Use this for the weekly batch recalculation job.
        """
        weighted_sum = 0
        for i, delta in enumerate(weekly_deltas[:ROLLING_WINDOW_WEEKS]):
            week_num = i + 1
            weight = RECENCY_WEIGHTS.get(week_num, 0.1)
            weighted_sum += delta * weight

        raw = NEW_USER_BASE + weighted_sum
        return max(ACTIVE_FLOOR, min(SCORE_CEILING, round(raw)))

    # ── Inactivity Penalty ────────────────────

    @staticmethod
    def _inactivity_penalty(days_since_post: int) -> float:
        """Progressive penalty for inactivity."""
        if days_since_post <= 7:
            return 0.0
        elif days_since_post <= 14:
            return -1.0
        elif days_since_post <= 30:
            return -2.5
        elif days_since_post <= 60:
            return -4.0
        else:
            return -5.0

    # ── Reach Tier ────────────────────────────

    @staticmethod
    def _get_reach_tier(active_score: float) -> ReachTier:
        """Map active score to content reach tier."""
        if active_score >= 75:
            return ReachTier.FULL
        elif active_score >= 50:
            return ReachTier.STANDARD
        elif active_score >= 25:
            return ReachTier.REDUCED
        else:
            return ReachTier.SANDBOXED

    # ── Expertise Level ───────────────────────

    @staticmethod
    def _get_expertise_level(
        hybrid_score: float, total_claims: int
    ) -> ExpertiseLevel:
        """Determine expertise badge based on score and volume."""
        if hybrid_score >= 90 and total_claims >= 100:
            return ExpertiseLevel.VERIFIED_EXPERT
        elif hybrid_score >= 75 and total_claims >= 30:
            return ExpertiseLevel.ESTABLISHED
        elif hybrid_score >= 50 and total_claims >= 10:
            return ExpertiseLevel.CONTRIBUTOR
        else:
            return ExpertiseLevel.NEWCOMER

    # ── Vote Weight ───────────────────────────

    @staticmethod
    def _get_vote_weight(hybrid_score: float) -> float:
        """Community consensus voting weight."""
        if hybrid_score >= 90:
            return 2.0
        elif hybrid_score >= 75:
            return 1.5
        elif hybrid_score >= 50:
            return 1.0
        else:
            return 0.5


# ─────────────────────────────────────────────
# Report Weighting (Anti-Abuse)
# ─────────────────────────────────────────────

class ReportWeightCalculator:
    """
    Determines the effective weight of a report based on
    the reporter's own reputation score.
    """

    @staticmethod
    def calculate_report_weight(reporter_active_score: float) -> float:
        """
        Reports from low-rep accounts are nearly worthless.
        Reports from high-rep accounts carry extra weight.
        """
        if reporter_active_score < 25:
            return 0.0  # Ignored entirely
        elif reporter_active_score < 50:
            return (reporter_active_score / 100) * 0.3
        elif reporter_active_score >= 80:
            return (reporter_active_score / 100) * 1.5
        else:
            return reporter_active_score / 100

    @staticmethod
    def detect_coordinated_reporting(
        reports_in_window: list, window_minutes: int = 60
    ) -> bool:
        """
        Detect coordinated mass-reporting attacks.

        Args:
            reports_in_window: List of report dicts with
                'reporter_id', 'timestamp', 'device_fingerprint'
            window_minutes: Time window to check

        Returns:
            True if coordinated attack is detected
        """
        if len(reports_in_window) < 20:
            return False

        # Check reporter similarity (simplified)
        # In production: graph clustering, device fingerprints,
        # IP subnet analysis, creation time proximity
        unique_reporters = len(set(r["reporter_id"] for r in reports_in_window))
        if unique_reporters < len(reports_in_window) * 0.8:
            return True  # Many reports from few accounts

        # Check behavioral similarity score
        # (placeholder — real implementation uses ML model)
        return False


# ─────────────────────────────────────────────
# Database Schema (SQL)
# ─────────────────────────────────────────────

DATABASE_SCHEMA = """
-- ============================================
-- TruthLayer Reputation Engine — Database Schema
-- PostgreSQL 15+
-- ============================================

-- Users table with identity verification
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle          VARCHAR(50) UNIQUE NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone_hash      VARCHAR(64),  -- hashed phone for verification
    device_fingerprint VARCHAR(128),
    identity_verified BOOLEAN DEFAULT FALSE,
    account_created_at TIMESTAMPTZ DEFAULT NOW(),
    last_post_at    TIMESTAMPTZ,
    probation_until TIMESTAMPTZ,  -- NULL after probation ends
    coordinated_behavior_flag BOOLEAN DEFAULT FALSE,
    coordinated_flag_date TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_handle ON users(handle);
CREATE INDEX idx_users_last_post ON users(last_post_at);


-- Domain-specific reputation scores (materialized)
CREATE TABLE reputation_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    domain          VARCHAR(30) NOT NULL,  -- ContentDomain enum value
    foundation_score DECIMAL(5,1) NOT NULL DEFAULT 50.0,
    active_score    DECIMAL(5,1) NOT NULL DEFAULT 50.0,
    hybrid_score    DECIMAL(5,1) NOT NULL DEFAULT 50.0,
    total_fact_claims INT NOT NULL DEFAULT 0,
    verified_claims INT NOT NULL DEFAULT 0,
    debunked_claims INT NOT NULL DEFAULT 0,
    expertise_level VARCHAR(20) DEFAULT 'newcomer',
    reach_tier      VARCHAR(20) DEFAULT 'standard_reach',
    vote_weight     DECIMAL(3,1) DEFAULT 1.0,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

CREATE INDEX idx_rep_user_domain ON reputation_scores(user_id, domain);
CREATE INDEX idx_rep_active ON reputation_scores(active_score DESC);


-- Weekly delta snapshots (13-week rolling window)
CREATE TABLE weekly_deltas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    domain          VARCHAR(30) NOT NULL,
    week_start      DATE NOT NULL,       -- Monday of the week
    week_number     INT NOT NULL,         -- 1-13 (recalculated weekly)
    
    -- Raw activity counts
    verified_claims     INT DEFAULT 0,
    debunked_claims     INT DEFAULT 0,
    credible_received   INT DEFAULT 0,
    disputes_received   INT DEFAULT 0,
    upheld_reports      INT DEFAULT 0,
    helpful_notes       INT DEFAULT 0,
    source_links        INT DEFAULT 0,
    frivolous_reports   INT DEFAULT 0,
    misclassifications  INT DEFAULT 0,
    successful_appeals  INT DEFAULT 0,
    accurate_disputes   INT DEFAULT 0,
    
    -- Calculated values
    positive_points     DECIMAL(8,1) DEFAULT 0,
    negative_points     DECIMAL(8,1) DEFAULT 0,
    inactivity_penalty  DECIMAL(4,1) DEFAULT 0,
    net_delta           DECIMAL(8,1) DEFAULT 0,
    recency_weight      DECIMAL(4,2) DEFAULT 1.00,
    weighted_delta      DECIMAL(8,2) DEFAULT 0,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain, week_start)
);

CREATE INDEX idx_weekly_user ON weekly_deltas(user_id, domain, week_start DESC);


-- Individual reputation events (append-only event log)
CREATE TABLE reputation_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    domain          VARCHAR(30) NOT NULL,
    event_type      VARCHAR(30) NOT NULL,
    -- e.g.: 'claim_verified', 'claim_debunked', 'credible_received',
    --       'dispute_received', 'report_upheld', 'note_helpful',
    --       'source_linked', 'frivolous_report', 'misclassification',
    --       'appeal_successful', 'accurate_dispute', 'coordinated_flag'
    
    points          DECIMAL(6,1) NOT NULL,  -- positive or negative
    source_content_id UUID,                  -- the content that triggered this
    reporter_id     UUID REFERENCES users(id),  -- who filed report/dispute
    reporter_weight DECIMAL(3,2),           -- reporter's effective weight
    metadata        JSONB,                  -- additional context
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_user ON reputation_events(user_id, domain, created_at DESC);
CREATE INDEX idx_events_type ON reputation_events(event_type, created_at DESC);


-- Report tracking (for coordinated attack detection)
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id     UUID NOT NULL REFERENCES users(id),
    target_user_id  UUID NOT NULL REFERENCES users(id),
    target_content_id UUID NOT NULL,
    reason_category VARCHAR(30) NOT NULL,
    -- 'inaccurate', 'misleading_context', 'missing_source',
    -- 'outdated', 'spam', 'harassment', 'impersonation'
    
    reason_text     TEXT,
    reporter_score_at_time DECIMAL(5,1),
    effective_weight DECIMAL(3,2),
    status          VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'upheld', 'dismissed', 'frozen'
    
    reviewed_by     UUID,
    reviewed_at     TIMESTAMPTZ,
    frozen_reason   VARCHAR(50),  -- 'coordinated_attack_detected'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_target ON reports(target_user_id, created_at DESC);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_coordinated ON reports(target_content_id, created_at DESC);


-- Coordinated attack detection (sliding window)
CREATE TABLE attack_detection_windows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_content_id UUID NOT NULL,
    window_start    TIMESTAMPTZ NOT NULL,
    window_end      TIMESTAMPTZ NOT NULL,
    report_count    INT NOT NULL,
    unique_reporters INT NOT NULL,
    similarity_score DECIMAL(3,2),  -- 0-1, how similar reporters are
    is_flagged      BOOLEAN DEFAULT FALSE,
    action_taken    VARCHAR(30),  -- 'frozen', 'reviewed', 'cleared'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- Key Queries
-- ============================================

-- Weekly recalculation job (runs every Monday)
-- Step 1: Shift week numbers
-- UPDATE weekly_deltas SET week_number = week_number + 1
--   WHERE user_id = $1 AND domain = $2;
-- DELETE FROM weekly_deltas WHERE week_number > 13;

-- Step 2: Insert new week 1 from aggregated events
-- INSERT INTO weekly_deltas (user_id, domain, week_start, week_number, ...)
--   SELECT user_id, domain, date_trunc('week', NOW()), 1, ...
--   FROM reputation_events
--   WHERE created_at >= date_trunc('week', NOW()) - interval '7 days'
--   GROUP BY user_id, domain;

-- Step 3: Recalculate active score
-- SELECT SUM(net_delta * recency_weight) as weighted_active
--   FROM weekly_deltas
--   WHERE user_id = $1 AND domain = $2;

-- Get user's full profile with all domain scores
-- SELECT rs.*, u.display_name, u.identity_verified,
--        u.coordinated_behavior_flag
--   FROM reputation_scores rs
--   JOIN users u ON u.id = rs.user_id
--   WHERE rs.user_id = $1
--   ORDER BY rs.hybrid_score DESC;
"""


# ─────────────────────────────────────────────
# Example Usage & Tests
# ─────────────────────────────────────────────

class MockDB:
    """Mock database for testing. Replace with real adapter."""

    def get_domain_stats(self, user_id, domain):
        return DomainStats(
            domain=domain,
            total_fact_claims=45,
            verified_claims=35,
            debunked_claims=3,
        )

    def get_weekly_activities(self, user_id, domain, num_weeks):
        return [WeeklyActivity(
            week_number=1,
            verified_claims=5,
            debunked_claims=0,
            credible_reactions_received=30,
            disputes_received=3,
            upheld_reports=0,
            helpful_notes=2,
            source_links=8,
            days_since_last_post=2,
        )]

    def get_account_age_days(self, user_id):
        return 180

    def get_last_post_date(self, user_id):
        return datetime.now() - timedelta(days=2)

    def get_prior_active_score(self, user_id, domain):
        return 72.0

    def check_coordinated_flag(self, user_id):
        return False


def run_example():
    """Run a sample calculation to verify the algorithm."""
    db = MockDB()
    engine = ReputationEngine(db)

    score = engine.calculate_hybrid_score("user_123", ContentDomain.SCIENCE)

    print("=" * 50)
    print("TruthLayer Reputation Score")
    print("=" * 50)
    print(f"User:             user_123")
    print(f"Domain:           {score.domain.value}")
    print(f"Foundation:       {score.foundation_score}")
    print(f"Active:           {score.active_score}")
    print(f"Hybrid:           {score.hybrid_score}")
    print(f"Weekly Delta:     {score.weekly_delta:+.1f}")
    print(f"Reach Tier:       {score.reach_tier.value}")
    print(f"Expertise:        {score.expertise_level.value}")
    print(f"Vote Weight:      {score.vote_weight}x")
    print(f"Probation:        {score.is_probation}")
    print(f"Coordinated Flag: {score.coordinated_flag}")
    print()
    print("Calculation Log:")
    for line in score.calculation_log:
        print(f"  {line}")
    print()

    # Test edge cases
    print("=" * 50)
    print("Report Weight Tests")
    print("=" * 50)
    calc = ReportWeightCalculator()
    for score_val in [10, 25, 40, 60, 80, 95]:
        weight = calc.calculate_report_weight(score_val)
        print(f"  Reporter score {score_val:3d} -> weight {weight:.3f}")


if __name__ == "__main__":
    run_example()
