# iPad Math Clone 📐

A powerful AI-powered drawing and analysis application that understands mathematical equations, diagrams, graphs, and educational content. Simply draw or sketch, and get instant AI-powered analysis powered by Google's Gemini AI.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=nextjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🌟 Features

### Core Drawing Capabilities
- **Freehand Drawing** - Smooth, responsive canvas with touch and mouse support
- **Shape Tools** - Draw lines, rectangles, and circles with precision
- **Color Palette** - 8 vibrant colors to choose from
- **Line Width Control** - 6 adjustable line thickness options (Thin to Huge)
- **Line Styles** - Solid, dashed, and filled options
- **Eraser Tool** - Cleanly remove drawn content
- **Math Symbols** - Drag-and-drop support for common mathematical symbols (+, -, ×, ÷, =, √, π, sin, cos, tan, log, ln)
- **Text Tool** - Add custom text annotations directly on the canvas
- **Clear Canvas** - Quick clear with stats reset

### AI Analysis Features
- **Intelligent Recognition** - Google Gemini 2.5 Flash AI analyzes drawings in real-time
- **Multi-Domain Understanding** - Recognizes and solves:
  - Mathematical equations and expressions
  - Physics problems and diagrams
  - Chemistry structures and reactions
  - Biological diagrams and concepts
  - Programming problems
  - Geometry and graphs
  - And much more!
- **Smart Auto-Tagging** - Automatically categorizes notes with intelligent tags:
  - STEM subjects (Math, Physics, Chemistry, Biology, Computer Science, Astronomy)
  - Humanities (Geography, History, Civics, Economics, Philosophy)
  - Creative fields (Art, Design, Literature, Music)
  - Applied sciences (Engineering, Architecture, Environment)
  - Research and Data analysis

### Organization & Management
- **Note Storage** - Save drawings with titles and AI analysis results
- **Smart Tags** - Auto-generated tags for quick categorization
- **Notes Sidebar** - Browse and manage all your saved notes
- **Note Details Panel** - View and edit saved notes with full metadata
- **Calendar View** - Visualize notes by date created
- **Analytics Dashboard** - Track your drawing statistics

### Advanced Analytics
- **Stroke Counter** - Track total strokes per drawing
- **Time Tracking** - Measure time spent on each drawing
- **Color Usage Stats** - See which colors you used most
- **Drawing History** - Timeline view of all your work

### User Experience
- **Dark Mode Support** - Eye-friendly dark theme with smooth transitions
- **Responsive Design** - Works seamlessly on desktop and tablet
- **Streaming Analysis** - Real-time text streaming for AI responses
- **Toast Notifications** - Clear feedback for all user actions
- **Keyboard & Touch Support** - Full compatibility with both input methods

---

## 🎯 Use Cases

Perfect for:
- **Students** - Solve homework problems and keep organized notes
- **Teachers** - Create interactive lessons and demonstrations
- **Engineers** - Sketch technical diagrams and specifications
- **Math Enthusiasts** - Explore and understand mathematical concepts
- **Scientists** - Document research and experimental setups
- **Designers** - Quick prototyping and ideation
- **Anyone** wanting AI-powered assistance with written content analysis

---

## 📸 Screenshots & Demo

### Main Drawing Interface
![Drawing Canvas](/public/placeholder.jpg?height=600&width=1200&query=drawing-canvas-interface-with-toolbar)
*Full-featured drawing canvas with toolbar, color palette, and shape tools*

### AI Analysis Panel
![Analysis Results](/public/placeholder.jpg?height=600&width=600&query=ai-analysis-results-streaming)
*Real-time AI analysis showing equation solutions and explanations*

### Notes Management
![Notes Sidebar](/public/placeholder.jpg?height=600&width=300&query=notes-sidebar-with-smart-tags)
*Browse saved notes with auto-generated smart tags*

### Calendar View
![Calendar](/public/placeholder.jpg?height=600&width=1200&query=calendar-view-note-timeline)
*Visualize your notes across dates*

### Analytics Dashboard
![Analytics](/public/placeholder.jpg?height=600&width=1200&query=analytics-dashboard-drawing-stats)
*Track your drawing statistics and productivity*

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | Next.js 16 with App Router |
| **UI Library** | React 19.2 with shadcn/ui |
| **Styling** | Tailwind CSS v4 + Custom CSS |
| **AI/ML** | Google Generative AI (Gemini 2.5 Flash) |
| **Math Engine** | Math.js for calculations |
| **OCR** | Tesseract.js for text recognition |
| **Data Processing** | TensorFlow.js |
| **Canvas Export** | html2canvas, dom-to-image |
| **Animations** | Framer Motion |
| **Math Rendering** | KaTeX for LaTeX equations |
| **Charts** | Recharts |
| **Notifications** | Sonner Toast |
| **State Management** | React Context + localStorage |
| **Deployment** | Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm package manager
- Google Gemini API key ([Get one free](https://ai.google.dev))

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/ipadmathclone.git
   cd ipadmathclone
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
---

## 📖 Usage Guide

### Drawing & Analysis
1. **Create** - Use the toolbar to select colors, shapes, and line styles
2. **Draw** - Sketch your equation, diagram, or problem on the canvas
3. **Add Math Symbols** - Drag and drop symbols like √, π, =, etc.
4. **Analyze** - Click the "Analyze" button to get AI-powered insights
5. **Save** - Give your drawing a title and save it for later reference

### Organizing Notes
- **View Notes** - Browse your saved drawings in the sidebar
- **Select Note** - Click to load a note back to the canvas
- **Calendar** - Switch to Calendar view to see notes by date
- **Analytics** - Check your drawing statistics and productivity
---

## 🤖 AI Capabilities

### Analysis Engine
The app uses **Google's Gemini 2.5 Flash** to analyze:

- **Equations** - Solve algebraic, calculus, and trigonometric equations
- **Graphs** - Interpret and explain charts and diagrams
- **Problems** - Provide step-by-step solutions
- **Concepts** - Explain mathematical and scientific concepts
- **Diagrams** - Understand technical and scientific illustrations

### Smart Tagging System
Automatically categorizes notes into 20+ tags including:
- Mathematics, Physics, Chemistry, Biology
- Computer Science, Astronomy
- Geography, History, Economics
- Art, Design, Music, Literature
- Engineering, Architecture, Environment
- Research, Data Analysis, AI/ML

---

## 📁 Project Structure

\`\`\`
ipadmathclone/
├── app/
│   ├── api/
│   │   ├── analyze/          # AI analysis endpoint
│   │   └── smart-tags/       # Tag generation endpoint
│   ├── notes/                # Notes management page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.jsx              # Main application
├── components/
│   ├── drawing-canvas.jsx    # Canvas component
│   ├── results-panel.jsx     # Analysis results display
│   ├── notes-sidebar.jsx     # Notes list
│   ├── note-details.jsx      # Note details panel
│   ├── calendar-view.jsx     # Calendar view
│   ├── analytics-dashboard.jsx
│   ├── header.jsx
│   └── ui/                   # shadcn/ui components
├── utils/
│   ├── storage.js            # localStorage management
│   ├── tagExtractor.js       # Smart tag extraction
│   └── tagColors.js          # Tag color mapping
├── lib/
│   ├── gemini-client.js      # Gemini API client
│   └── math-engine.js        # Math calculations
├── public/
└── styles/
\`\`\`

---

## 📊 Data Storage

All data is stored locally in your browser using **localStorage**:
- Drawing images (as PNG base64)
- Analysis text
- Tags and metadata
- Drawing statistics

No data is sent to external servers except for AI analysis through Gemini API.

---

## 🐛 Troubleshooting

### Issue: "Analysis timed out"
- The AI analysis takes too long. Try with a simpler drawing or smaller file.
- Check your internet connection.
- Verify your Gemini API key is valid.

### Issue: Canvas doesn't respond
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors
- Ensure JavaScript is enabled

### Issue: Notes not saving
- Check browser localStorage is enabled
- Clear cache and reload
- Try a different browser

### Issue: Slow performance
- Reduce the number of saved notes
- Clear browser cache
- Use a modern browser (Chrome, Firefox, Safari)

---

## 🔐 Privacy & Security

- **Local Storage** - All drawings stored locally on your device
- **Secure API** - HTTPS encryption for Gemini API calls
- **No Data Tracking** - We don't track or store your drawings
- **Open Source** - Full transparency on what the code does

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Generative AI](https://ai.google.dev) for Gemini API
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Next.js](https://nextjs.org) for the powerful framework

---


## 🚀 Roadmap

- [ ] Cloud synchronization with Supabase
- [ ] Export notes as PDF
- [ ] Collaborative drawing sessions
- [ ] Mobile app (React Native)
- [ ] Plugin system for custom AI models
- [ ] Advanced shape library
- [ ] Real-time collaboration
- [ ] Handwriting recognition improvements
- [ ] Custom AI prompt builder
- [ ] Integration with popular services

---

**Made with ❤️ by Divyan Palshetkar**

*Last Updated: November 2025*
