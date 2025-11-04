"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Type, X } from "lucide-react"

export default function TextTool({ onAddText, isActive, onToggle }) {
  const [showPanel, setShowPanel] = useState(false)
  const [text, setText] = useState("")
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState("#000000")
  const [fontFamily, setFontFamily] = useState("Arial")

  const handleAddText = () => {
    if (text.trim()) {
      onAddText({
        text: text,
        fontSize: fontSize,
        color: fontColor,
        fontFamily: fontFamily,
      })
      setText("")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`px-3 py-2 rounded border transition ${
          showPanel
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <Type size={18} />
      </button>
      {showPanel && (
        <div className="absolute top-24 left-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-lg z-50 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Add Text</h3>
            <button onClick={() => setShowPanel(false)} className="p-1">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Text</label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text"
                onKeyPress={(e) => e.key === "Enter" && handleAddText()}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Font Size</label>
              <div className="flex gap-2">
                <Input
                  type="range"
                  min="8"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number.parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-12 text-right">{fontSize}px</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-2 py-2 border rounded bg-white dark:bg-gray-800 text-sm"
              >
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
                <option>Georgia</option>
                <option>Verdana</option>
                <option>Comic Sans MS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Color</label>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddText} disabled={!text.trim()} className="flex-1 bg-blue-500">
                Add Text
              </Button>
              <Button onClick={() => setShowPanel(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
              After clicking "Add Text", click on the canvas where you want to place the text.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
