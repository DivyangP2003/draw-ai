"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getAllNotes } from "@/utils/storage";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select"; // optional: adapt if you don't have Select
import { toast } from "sonner";

/**
 * Dynamic Analytics Dashboard (PowerBI-style)
 *
 * - Drop-in replacement for previous analytics-dashboard.jsx
 * - Uses getAllNotes() as data source (local storage)
 *
 * Notes:
 * - For export-to-image, this tries to dynamically import html2canvas.
 * - AI summary is a heuristic generator (client-side). You can replace with Gemini call.
 */

export default function AnalyticsDashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [presetRange, setPresetRange] = useState("30"); // days: 7, 30, 90, all(0)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  // Chart UI
  const [timeChartType, setTimeChartType] = useState("line"); // 'line' | 'bar'
  const [drillFilters, setDrillFilters] = useState({}); // e.g., { tag: 'sketch' } or { week: '2025-W1' }

  // stats derived
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalTime: 0,
    totalStrokes: 0,
    avgTimePerNote: 0,
    collections: [],
    topColors: [],
    timeChart: [],
    tagsChart: [],
    weeklyNotes: [],
  });

  const containerRef = useRef(null);

  // Polling / Live sync
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const data = await getAllNotes();
      if (!mounted) return;
      setNotes(data || []);
      setLoading(false);
    };
    load();
    const id = setInterval(load, 5000); // poll every 5s for live updates
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Derived available collections & tags (for filters)
  const allCollections = useMemo(() => {
    const setC = new Set();
    notes.forEach((n) => {
      if (n.collection) setC.add(n.collection);
    });
    return Array.from(setC);
  }, [notes]);

  const allTags = useMemo(() => {
    const setT = new Set();
    notes.forEach((n) => (n.tags || []).forEach((t) => setT.add(t)));
    return Array.from(setT);
  }, [notes]);

  // Apply filters (presets, date range, collection/tag, drilldowns)
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // preset range
    if (presetRange && presetRange !== "0") {
      const days = parseInt(presetRange, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter((n) => new Date(n.createdAt) >= cutoff);
    }

    // explicit date range (if set)
    if (startDate) {
      // treat startDate as local midnight
      const [sy, sm, sd] = startDate.split("-").map(Number);
      const s = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
      filtered = filtered.filter((n) => new Date(n.createdAt) >= s);
    }

    if (endDate) {
      // treat endDate as local end of day
      const [ey, em, ed] = endDate.split("-").map(Number);
      const e = new Date(ey, em - 1, ed, 23, 59, 59, 999);
      filtered = filtered.filter((n) => new Date(n.createdAt) <= e);
    }

    // collection
    if (collectionFilter) {
      filtered = filtered.filter((n) => n.collection === collectionFilter);
    }

    // tag
    if (tagFilter) {
      filtered = filtered.filter((n) => (n.tags || []).includes(tagFilter));
    }

    // drilldown filters (allow multiple keys)
    Object.entries(drillFilters).forEach(([k, v]) => {
      if (!v) return;
      if (k === "tag")
        filtered = filtered.filter((n) => (n.tags || []).includes(v));
      else if (k === "collection")
        filtered = filtered.filter((n) => n.collection === v);
      else if (k === "week")
        filtered = filtered.filter((n) => {
          const created = new Date(n.createdAt);
          const weekLabel = `${created.getFullYear()}-W${Math.ceil(
            created.getDate() / 7
          )}`;
          return weekLabel === v;
        });
    });

    return filtered;
  }, [
    notes,
    presetRange,
    startDate,
    endDate,
    collectionFilter,
    tagFilter,
    drillFilters,
  ]);

  // Compute stats from filteredNotes
  useEffect(() => {
    const compute = () => {
      const notesLocal = filteredNotes || [];
      let totalTime = 0;
      let totalStrokes = 0;
      const collectionMap = {};
      const colorMap = {};
      const timeByDay = {};
      const tagMap = {};
      const weeklyMap = {};

      notesLocal.forEach((note) => {
        const created = new Date(note.createdAt || Date.now());

        totalTime += note.stats?.timeSpent || 0;
        totalStrokes += note.stats?.strokeCount || 0;

        if (note.collection)
          collectionMap[note.collection] =
            (collectionMap[note.collection] || 0) + 1;
        (note.stats?.colorsUsed || []).forEach(
          (color) => (colorMap[color] = (colorMap[color] || 0) + 1)
        );

        const dayKey = created.toLocaleDateString("en-CA"); // local YYYY-MM-DD
        timeByDay[dayKey] =
          (timeByDay[dayKey] || 0) + (note.stats?.timeSpent || 0);

        (note.tags || []).forEach(
          (tag) => (tagMap[tag] = (tagMap[tag] || 0) + 1)
        );

        const week = `${created.getFullYear()}-W${Math.ceil(
          created.getDate() / 7
        )}`;
        weeklyMap[week] = (weeklyMap[week] || 0) + 1;
      });

      const avgTimePerNote = notesLocal.length
        ? Math.round(totalTime / notesLocal.length)
        : 0;

      const chartData = Object.entries(timeByDay)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-7)
        .map(([day, time]) => ({
          day: new Date(day).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          dayISO: day, // ✅ add ISO version for onClick use
          time,
        }));

      // keep last N days (depending on preset) but allow full when preset=0
      const timeChart = chartData;

      const tagsChart = Object.entries(tagMap)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));

      const weeklyNotes = Object.entries(weeklyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, count]) => ({ week, count }));

      const topColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([color, count]) => ({ name: color, value: count, color }));

      setStats({
        totalNotes: notesLocal.length,
        totalTime,
        totalStrokes,
        avgTimePerNote,
        collections: Object.entries(collectionMap).map(([name, value]) => ({
          name,
          value,
        })),
        topColors,
        timeChart,
        tagsChart,
        weeklyNotes,
      });
    };

    compute();
  }, [filteredNotes]);

  // Animated KPI counters (simple count up)
  const useAnimatedValue = (value, ms = 700) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let raf, start;
      const from = Number(display);
      const to = Number(value);
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min(1, (timestamp - start) / ms);
        const cur = Math.round(from + (to - from) * progress);
        setDisplay(cur);
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return display;
  };

  const animatedTotalNotes = useAnimatedValue(stats.totalNotes);
  const animatedTotalTime = useAnimatedValue(Math.round(stats.totalTime / 60)); // minutes
  const animatedTotalStrokes = useAnimatedValue(stats.totalStrokes);
  const animatedAvgTime = useAnimatedValue(stats.avgTimePerNote);

  // Smart insight generator (simple heuristics)
  const insight = useMemo(() => {
    if (!notes || notes.length === 0)
      return "No notes available to analyze yet.";
    const n = filteredNotes.length;
    if (n === 0) return "No notes match the selected filters.";
    const mostUsedTag = stats.tagsChart[0]?.tag || null;
    const topCollection = stats.collections[0]?.name || null;
    const busiestWeek =
      stats.weeklyNotes.slice().sort((a, b) => b.count - a.count)[0]?.week ||
      null;
    const timeMins = Math.round(stats.totalTime / 60);
    return `Over the selected range: ${n} note${
      n > 1 ? "s" : ""
    }, ${timeMins} minutes total. Most frequent topic: ${
      mostUsedTag || "N/A"
    }. Top collection: ${topCollection || "N/A"}. Busiest week: ${
      busiestWeek || "N/A"
    }.`;
  }, [notes, filteredNotes, stats]);

  // Drill-down helpers
  const handleDrillTag = (tag) => {
    setDrillFilters((prev) => ({ ...prev, tag }));
  };
  const handleDrillCollection = (collection) => {
    setDrillFilters((prev) => ({ ...prev, collection }));
  };
  const handleDrillWeek = (week) => {
    setDrillFilters((prev) => ({ ...prev, week }));
  };
  const clearDrill = () => setDrillFilters({});

  // Export CSV
  const exportCSV = (rows) => {
  if (!rows || !rows.length) {
    toast.error("No data to export");
    return;
  }

  const now = new Date().toISOString().slice(0, 10);
  const meta = `# Export Date: ${now}\n# Filters: Range=${presetRange} days | Collection=${collectionFilter || "All"} | Tag=${tagFilter || "All"}\n\n`;

  const cols = [
    "id", "title", "createdDate", "createdTime", "weekday", "month",
    "collection", "tags", "tagsCount", "timeSpentSec", "timeSpentMin", "strokeCount"
  ];

  const header = cols.join(",") + "\n";

  const lines = rows.map((r) => {
    const created = new Date(r.createdAt);
    const createdDate = created.toLocaleDateString("en-CA");
    const createdTime = created.toLocaleTimeString("en-GB");
    const weekday = created.toLocaleDateString("en-US", { weekday: "long" });
    const month = created.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const tags = (r.tags || []).join("|");
    const tagsCount = (r.tags || []).length;
    const timeSpentSec = r.stats?.timeSpent ?? 0;
    const timeSpentMin = (timeSpentSec / 60).toFixed(2);
    const strokeCount = r.stats?.strokeCount ?? 0;

    const rowData = [
      r.id || "",
      r.title || "",
      createdDate,
      createdTime,
      weekday,
      month,
      r.collection || "",
      tags,
      tagsCount,
      timeSpentSec,
      timeSpentMin,
      strokeCount,
    ];

    return rowData.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });

  const csv = meta + header + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notes_export_${now}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success("Enhanced CSV exported ✅");
};

  

  const COLORS = [
    "#4F46E5",
    "#F59E0B",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#7C3AED",
  ];

  return (
    <div ref={containerRef} className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{insight}</p>
        </div>

        <div className="flex gap-2 items-center">
          <Button onClick={() => exportCSV(filteredNotes)}>Export CSV</Button>
          {/* <Button onClick={exportImage}>Export Image</Button> */}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm font-medium">Range:</label>
            <select
              value={presetRange}
              onChange={(e) => setPresetRange(e.target.value)}
              className="px-2 py-1 border rounded-md bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 transition-colors"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="0">All time</option>
            </select>

            <label className="text-sm font-medium ml-2">Or Date range:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 rounded-md bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 transition-colors"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 rounded-md bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="px-2 py-1 rounded-md bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 transition-colors"
            >
              <option value="">All collections</option>
              {allCollections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-2 py-1 rounded-md bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 transition-colors"
            >
              <option value="">All tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <Button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPresetRange("30");
                setCollectionFilter("");
                setTagFilter("");
                clearDrill();
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Notes</div>
          <div className="text-3xl font-bold">{animatedTotalNotes}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Time (m)</div>
          <div className="text-3xl font-bold">{animatedTotalTime}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Strokes</div>
          <div className="text-3xl font-bold">{animatedTotalStrokes}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Avg Time / Note (s)</div>
          <div className="text-3xl font-bold">{animatedAvgTime}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Topics Detected</div>
          <div className="text-3xl font-bold">{stats.tagsChart.length}</div>
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Time Spent</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Chart:</label>
              <select
                value={timeChartType}
                onChange={(e) => setTimeChartType(e.target.value)}
                className="px-2 py-1 rounded-md bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 transition-colors"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
              </select>
              <div className="text-xs text-muted-foreground ml-2">
                Click bars/points to drill
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              {timeChartType === "line" ? (
                <LineChart data={stats.timeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ReTooltip />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#3b82f6"
                    animationDuration={400}
                    activeDot={{
                      onClick: (d) => {
                        const dayValue =
                          d?.payload?.dayISO ||
                          d?.payload?.day ||
                          d?.activeLabel ||
                          null;
                        if (dayValue) handleDrillWeek(dayValue);
                      },
                    }}
                    onClick={(d) => {
                      const dayValue =
                        d?.activeLabel ||
                        d?.payload?.dayISO ||
                        d?.payload?.day ||
                        null;
                      if (dayValue) handleDrillWeek(dayValue);
                    }}
                  />
                </LineChart>
              ) : (
                <BarChart data={stats.timeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ReTooltip />
                  <Bar
                    dataKey="time"
                    fill="#3b82f6"
                    onClick={(d) => handleDrillWeek(d.week)}
                    // make each bar clickable by reading payload in tooltip, use onClick of each cell below
                  >
                    {stats.timeChart.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        onClick={() => handleDrillWeek(entry.dayISO)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Notes Created per Week</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats.weeklyNotes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ReTooltip />
                <Bar dataKey="count" fill="#10B981">
                  {stats.weeklyNotes.map((entry, i) => (
                    <Cell
                      key={`week-${i}`}
                      onClick={() => handleDrillWeek(entry.week)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tags + Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="font-semibold mb-3">AI Topic Frequency</h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.tagsChart}
                  dataKey="count"
                  nameKey="tag"
                  outerRadius={90}
                  label
                  isAnimationActive
                >
                  {stats.tagsChart.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={COLORS[i % COLORS.length]}
                      onClick={() => handleDrillTag(entry.tag)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Click a slice to filter by that topic.
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Notes by Collection</h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={stats.collections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Bar dataKey="value" fill="#8b5cf6">
                  {stats.collections.map((entry, i) => (
                    <Cell
                      key={`col-${i}`}
                      onClick={() => handleDrillCollection(entry.name)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Click a bar to drill into that collection.
          </div>
        </Card>
      </div>

      {/* Top Colors */}
      {stats.topColors.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Top Colors Used</h2>
          <div className="flex gap-4 flex-wrap">
            {stats.topColors.map((item, idx) => (
              <div key={item.name} className="text-center">
                <div
                  className="w-16 h-16 rounded-lg mb-2 border-2"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs font-semibold">{item.value} times</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
