import type { CardTheme } from "@sigil/core/themes";
import { hexToRgba } from "@sigil/core/color";
import type { CardKind, SigilProfile } from "@/lib/studio-data";

interface CardProps {
  profile: SigilProfile;
  theme: CardTheme;
  animate: boolean;
  active: boolean;
}

const mono = { fontFamily: "var(--font-mono)" } as const;
const display = { fontFamily: "var(--font-display)" } as const;

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function heatAlpha(i: number): number {
  if (i <= 0) return 0.05;
  return 0.22 + i * 0.2;
}

function CardFrame({
  theme,
  title,
  right,
  children,
  active,
}: {
  theme: CardTheme;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <div
      className="rounded-lg p-4 transition-shadow duration-200"
      style={{
        background: theme.bg,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        boxShadow: active
          ? `0 0 0 1px ${theme.accent}, 0 10px 30px -10px ${hexToRgba(theme.accent, 0.5)}`
          : "var(--shadow-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[12px] tracking-[0.06em] uppercase"
          style={{ ...display, color: theme.text }}
        >
          {title}
        </span>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function StatsCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Stats & rank" active={active}
      right={
        <span
          className="rounded-full px-2 py-0.5 text-[10px]"
          style={{ border: `1px solid ${theme.gold}`, color: theme.gold, ...mono }}
        >
          Top {profile.rankPercent}%
        </span>
      }
    >
      <div className="flex items-baseline gap-2">
        <span className="text-[34px] leading-none" style={{ color: theme.accent, ...mono }}>
          {fmt(profile.contributions)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: theme.muted }}>
          contributions
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ["Repos", fmt(profile.repos)],
          ["Stars", fmt(profile.stars)],
          ["Followers", fmt(profile.followers)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md py-2" style={{ background: hexToRgba(theme.accent, 0.06) }}>
            <div className="text-[15px]" style={{ color: theme.text, ...mono }}>{value}</div>
            <div className="text-[9px] uppercase tracking-[0.12em]" style={{ color: theme.muted }}>{label}</div>
          </div>
        ))}
      </div>
    </CardFrame>
  );
}

function StreakCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Streak" active={active}
      right={<span className="size-2 rounded-full" style={{ background: theme.accent }} />}
    >
      <div className="flex items-end gap-2">
        <span className="text-[38px] leading-none" style={{ color: theme.accent, ...mono }}>
          {profile.streakCurrent}
        </span>
        <span className="pb-1 text-[11px] uppercase tracking-[0.15em]" style={{ color: theme.muted }}>
          day streak
        </span>
      </div>
      <div className="mt-3 flex items-end gap-1 h-8">
        {profile.activity.slice(-7).map((v, i) => {
          const h = Math.max(12, Math.min(100, (v / 60) * 100));
          return (
            <span
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${h}%`, background: hexToRgba(theme.accent, 0.3 + (i / 7) * 0.6) }}
            />
          );
        })}
      </div>
      <div className="mt-2 text-[10px]" style={{ color: theme.muted, ...mono }}>
        best · {profile.streakBest} days
      </div>
    </CardFrame>
  );
}

function LanguagesCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Languages" active={active}>
      <div className="space-y-2.5">
        {profile.languages.map((l) => (
          <div key={l.name}>
            <div className="flex justify-between text-[11px]" style={{ color: theme.text, ...mono }}>
              <span>{l.name}</span>
              <span style={{ color: theme.muted }}>{l.pct}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full" style={{ background: hexToRgba(theme.accent, 0.12) }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${l.pct}%`, background: theme.accent }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardFrame>
  );
}

function HeatmapCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Contribution heatmap" active={active}
      right={<span className="text-[10px]" style={{ color: theme.muted, ...mono }}>26 wks</span>}
    >
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: "repeat(26, 1fr)",
          gridTemplateRows: "repeat(7, 1fr)",
          gridAutoFlow: "column",
        }}
      >
        {profile.heatmap.map((v, i) => (
          <span
            key={i}
            className="aspect-square rounded-[2px]"
            style={{
              background: hexToRgba(theme.accent, heatAlpha(v)),
              outline: v === 0 ? `1px solid ${hexToRgba(theme.accent, 0.08)}` : "none",
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[9px]" style={{ color: theme.muted, ...mono }}>
        <span>less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="size-2 rounded-[2px]" style={{ background: hexToRgba(theme.accent, heatAlpha(i)) }} />
        ))}
        <span>more</span>
      </div>
    </CardFrame>
  );
}

function SkylineCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Isometric skyline" active={active}>
      <div
        className="h-20 overflow-hidden rounded-md"
        style={{ background: hexToRgba(theme.accent, 0.04) }}
      >
        <div
          className="flex items-end gap-[3px] h-full px-1"
          style={{ transform: "perspective(360px) rotateX(46deg)", transformOrigin: "bottom" }}
        >
          {profile.activity.concat(profile.activity).map((v, i) => {
            const h = Math.max(18, Math.min(100, (v / 60) * 100));
            return (
              <span
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(to top, ${theme.accent}, ${hexToRgba(theme.accent, 0.4)})`,
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-2 text-[10px]" style={{ color: theme.muted, ...mono }}>
        contributions · 3D skyline
      </div>
    </CardFrame>
  );
}

function ActivityCard({ profile, theme, active }: CardProps) {
  const max = Math.max(1, ...profile.activity);
  return (
    <CardFrame theme={theme} title="Activity graph" active={active}>
      <div className="flex items-end gap-1.5 h-16">
        {profile.activity.map((v, i) => {
          const h = Math.max(8, (v / max) * 100);
          const isPeak = v === max;
          return (
            <span
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${h}%`,
                background: isPeak ? theme.accent : hexToRgba(theme.accent, 0.45),
              }}
            />
          );
        })}
      </div>
      <div className="mt-2 text-[10px]" style={{ color: theme.muted, ...mono }}>
        commits · last 12 weeks
      </div>
    </CardFrame>
  );
}

function AchievementsCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Achievements" active={active}
      right={
        <span className="text-[10px]" style={{ color: theme.muted, ...mono }}>
          {profile.achievements.filter((a) => a.earned).length} earned
        </span>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {profile.achievements.map((a) => {
          const earned = a.earned;
          return (
            <span
              key={a.name}
              className="rounded-full px-2.5 py-1 text-[10px]"
              style={{
                border: `1px solid ${earned ? theme.gold : theme.border}`,
                color: earned ? theme.gold : theme.muted,
                background: earned ? hexToRgba(theme.gold, 0.08) : "transparent",
                ...mono,
              }}
            >
              {a.name}
            </span>
          );
        })}
      </div>
    </CardFrame>
  );
}

function RepoCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Featured repo" active={active}>
      <div className="flex items-center gap-1.5" style={{ color: theme.accent, ...mono }}>
        <span>◆</span>
        <span className="text-[12px]">{profile.repo.name}</span>
      </div>
      <p className="mt-2 text-[12px] leading-snug" style={{ color: theme.muted }}>
        {profile.repo.description}
      </p>
      <div className="mt-2.5 flex items-center gap-3 text-[10px]" style={{ color: theme.muted, ...mono }}>
        <span>{profile.repo.language}</span>
        <span>★ {fmt(profile.repo.stars)}</span>
        <span>⑂ {profile.repo.forks}</span>
      </div>
    </CardFrame>
  );
}

function BannerCard({ profile, theme, active }: CardProps) {
  return (
    <CardFrame theme={theme} title="Banner" active={active}>
      <div
        className="rounded-md p-3"
        style={{
          background: `linear-gradient(120deg, ${hexToRgba(theme.accent, 0.1)}, transparent)`,
          border: `1px solid ${hexToRgba(theme.accent, 0.25)}`,
        }}
      >
        <div className="text-[20px] leading-tight" style={{ color: theme.text, ...display }}>
          {profile.name}
        </div>
        <div className="mt-0.5 text-[10px]" style={{ color: theme.muted, ...mono }}>
          @{profile.username} · {profile.bio}
        </div>
      </div>
    </CardFrame>
  );
}

const RENDERERS: Record<CardKind, (p: CardProps) => React.ReactNode> = {
  overview: StatsCard,
  streak: StreakCard,
  languages: LanguagesCard,
  heatmap: HeatmapCard,
  skyline: SkylineCard,
  activity: ActivityCard,
  achievements: AchievementsCard,
  repo: RepoCard,
  banner: BannerCard,
};

export function renderCard(kind: CardKind, props: CardProps): React.ReactNode {
  const R = RENDERERS[kind];
  return R ? R(props) : null;
}

export function CardGrid({
  kinds,
  profile,
  theme,
  animate,
  activeId,
  onActive,
}: {
  kinds: CardKind[];
  profile: SigilProfile;
  theme: CardTheme;
  animate: boolean;
  activeId: CardKind | null;
  onActive: (id: CardKind | null) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {kinds.map((kind) => (
        <div
          key={kind}
          onMouseEnter={() => onActive(kind)}
          onMouseLeave={() => onActive(null)}
          style={animate ? { animation: "sg-fade-in 0.5s cubic-bezier(0.2,0.8,0.2,1) both" } : undefined}
        >
          {renderCard(kind, { profile, theme, animate, active: activeId === kind })}
        </div>
      ))}
    </div>
  );
}
