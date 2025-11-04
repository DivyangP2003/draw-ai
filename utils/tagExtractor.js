// utils/tagExtractor.js

export function extractTagsFromAnalysis(text) {
  if (!text) return ["general"];
  const lower = text.toLowerCase();

  const topics = {
    // 📘 STEM Subjects
    math: [
      "equation", "algebra", "geometry", "calculus", "fraction",
      "addition", "subtraction", "multiplication", "division", "number",
      "solve", "integral", "derivative", "matrix", "trigonometry",
    ],
    physics: [
      "velocity", "acceleration", "force", "energy", "motion", "mass",
      "gravity", "kinematics", "friction", "momentum", "thermodynamics",
      "optics", "wave", "magnetism", "electricity", "quantum", "relativity",
    ],
    chemistry: [
      "molecule", "reaction", "atom", "compound", "acid", "base", "solution",
      "chemical", "bond", "element", "oxidation", "ion", "catalyst",
      "periodic", "organic", "inorganic",
    ],
    biology: [
      "cell", "organism", "plant", "animal", "photosynthesis", "tissue",
      "organ", "dna", "gene", "evolution", "bacteria", "virus", "enzyme",
      "ecosystem", "species", "microbiology", "zoology", "botany",
    ],
    computer: [
      "program", "code", "python", "java", "algorithm", "data", "software",
      "hardware", "network", "machine learning", "ai", "neural", "model",
      "computing", "database", "logic gate", "automation",
    ],
    astronomy: [
      "planet", "star", "galaxy", "space", "orbit", "telescope", "universe",
      "solar", "asteroid", "comet", "cosmos", "black hole", "nasa",
    ],

    // 🌍 Humanities
    geography: [
      "map", "river", "mountain", "climate", "earth", "continent", "region",
      "valley", "terrain", "ocean", "plate tectonics", "weather", "rainfall",
    ],
    history: [
      "war", "empire", "dynasty", "ancient", "medieval", "freedom",
      "revolution", "civilization", "archaeology", "king", "queen",
      "colony", "historic", "timeline",
    ],
    civics: [
      "constitution", "democracy", "government", "rights", "duties",
      "citizen", "law", "justice", "parliament", "election", "policy",
      "freedom", "republic", "assembly",
    ],
    economics: [
      "economy", "money", "trade", "market", "tax", "inflation",
      "budget", "finance", "gdp", "growth", "income", "investment",
      "capital", "production", "employment",
    ],
    philosophy: [
      "ethics", "logic", "reason", "truth", "belief", "existence",
      "morality", "mind", "soul", "consciousness", "wisdom", "metaphysics",
    ],

    // 🎨 Creative Fields
    art: [
      "drawing", "sketch", "painting", "color", "composition", "pattern",
      "aesthetic", "canvas", "illustration", "shade", "texture",
    ],
    design: [
      "ui", "ux", "typography", "layout", "proportion", "concept",
      "poster", "graphic", "visual", "interface", "prototype",
    ],
    literature: [
      "poem", "story", "novel", "character", "theme", "metaphor",
      "drama", "plot", "author", "literary", "fiction", "nonfiction",
    ],
    music: [
      "song", "melody", "rhythm", "beat", "instrument", "chord",
      "note", "harmony", "vocal", "lyrics", "scale", "tempo", "composition",
    ],

    // ⚙️ Applied & Misc
    engineering: [
      "structure", "bridge", "design", "circuit", "mechanical", "electrical",
      "civil", "system", "robotics", "aerodynamics", "blueprint", "machine",
    ],
    architecture: [
      "building", "floor plan", "elevation", "design", "structure",
      "construction", "material", "space", "interior", "layout", "column",
    ],
    environment: [
      "pollution", "climate", "recycle", "biodiversity", "forest",
      "renewable", "sustainability", "ecosystem", "greenhouse", "carbon",
      "conservation", "rainfall", "habitat",
    ],
    research: [
      "experiment", "hypothesis", "data", "methodology", "survey",
      "paper", "journal", "findings", "statistics", "analysis", "study",
    ],
    ai: [
      "neural network", "artificial intelligence", "machine learning",
      "deep learning", "data", "model", "prediction", "classification",
      "computer vision", "nlp", "automation",
    ],

    // 🧠 Fallbacks
    data: [
      "dataset", "statistics", "chart", "graph", "analysis", "insight",
      "trend", "visualization", "pattern", "correlation",
    ],
  };

  const tags = [];
  for (const [topic, words] of Object.entries(topics)) {
    if (words.some((w) => lower.includes(w))) tags.push(topic);
  }

  return tags.length ? [...new Set(tags)] : ["general"];
}
