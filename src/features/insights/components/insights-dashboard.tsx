import { gradeColor } from "@/features/lookup/presentation";
import type { Insights } from "@/server/kfs/insights";
import { gpa } from "../format";
import { BarList } from "./bar-list";
import { CourseTable } from "./course-table";
import { Leaderboard } from "./leaderboard";
import { Panel } from "./panel";
import { RecentList } from "./recent-list";
import { StatCard } from "./stat-card";

export function InsightsDashboard({ data }: { data: Insights }) {
  const now = data.generatedAt || 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Insights
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Cohort overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Aggregated from cached lookups. Private dashboard.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Students" value={String(data.totalStudents)} />
        <StatCard
          label="Avg GPA"
          value={gpa(data.avgGpa)}
          hint={`median ${gpa(data.medianGpa)}`}
        />
        <StatCard label="Top GPA" value={gpa(data.topGpa)} />
        <StatCard
          label="With GPA"
          value={String(data.withGpa)}
          hint={`of ${data.totalStudents}`}
        />
        <StatCard
          label="Courses"
          value={String(data.distinctCourses)}
          hint={`${data.totalCourses} enrollments`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="GPA distribution">
          <BarList items={data.bands} />
        </Panel>
        <Panel title="Grade distribution">
          <BarList
            items={data.grades.map((g) => ({
              label: g.label,
              count: g.count,
              color: g.label === "?" ? undefined : gradeColor(g.label),
            }))}
          />
        </Panel>
        <Panel title="By level">
          <BarList items={data.levels} />
        </Panel>
        <Panel title="By faculty">
          <BarList items={data.faculties} />
        </Panel>
      </div>

      <Panel title="Leaderboard" subtitle="Top 20 by GPA">
        <Leaderboard rows={data.leaderboard} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Hardest courses" subtitle="Lowest average score">
          <CourseTable rows={data.hardestCourses} metric="avg" />
        </Panel>
        <Panel title="Most enrolled" subtitle="By student count">
          <CourseTable rows={data.popularCourses} metric="pass" />
        </Panel>
      </div>

      <Panel title="Recent lookups">
        <RecentList rows={data.recent} now={now} />
      </Panel>

      <footer className="pt-2 pb-8 text-xs text-muted-foreground/60">
        ai.kfs.swoo.me · insights
      </footer>
    </div>
  );
}
