// utils/tagColors.js

export const TAG_COLORS = {
  // 📘 STEM Subjects
  math: "bg-blue-900/40 text-blue-300 border border-blue-700",
  physics: "bg-green-900/40 text-green-300 border border-green-700",
  chemistry: "bg-yellow-900/40 text-yellow-300 border border-yellow-700",
  biology: "bg-lime-900/40 text-lime-300 border border-lime-700",
  computer: "bg-cyan-900/40 text-cyan-300 border border-cyan-700",
  astronomy: "bg-indigo-900/40 text-indigo-300 border border-indigo-700",

  // 🌍 Humanities
  geography: "bg-emerald-900/40 text-emerald-300 border border-emerald-700",
  history: "bg-orange-900/40 text-orange-300 border border-orange-700",
  civics: "bg-rose-900/40 text-rose-300 border border-rose-700",
  economics: "bg-amber-900/40 text-amber-300 border border-amber-700",
  philosophy: "bg-purple-900/40 text-purple-300 border border-purple-700",

  // 🎨 Creative Fields
  art: "bg-pink-900/40 text-pink-300 border border-pink-700",
  design: "bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700",
  literature: "bg-violet-900/40 text-violet-300 border border-violet-700",
  music: "bg-teal-900/40 text-teal-300 border border-teal-700",

  // ⚙️ Applied & Misc
  engineering: "bg-sky-900/40 text-sky-300 border border-sky-700",
  architecture: "bg-stone-800/50 text-stone-200 border border-stone-700",
  environment: "bg-green-800/40 text-green-200 border border-green-700",
  research: "bg-slate-800/50 text-slate-200 border border-slate-600",
  data: "bg-cyan-900/40 text-cyan-200 border border-cyan-700",
  ai: "bg-indigo-900/40 text-indigo-300 border border-indigo-700",

  // 🧠 General / Uncategorized
  general: "bg-gray-800/60 text-gray-300 border border-gray-700",
  unknown: "bg-zinc-800/60 text-zinc-300 border border-zinc-700",
};

export function getTagStyle(tag) {
  const key = tag?.toLowerCase()?.trim() || "general";
  return TAG_COLORS[key] || TAG_COLORS.general;
}
