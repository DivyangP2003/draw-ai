"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TextTool from "@/components/text-tool";
import { BarChart3, RotateCcw, RotateCw } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const COLORS = [
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
];
const SHAPES = ["free", "line", "rectangle", "circle", "eraser"];
const LINE_WIDTHS = [
  { label: "Thin", value: 2 },
  { label: "Medium", value: 4 },
  { label: "Thick", value: 6 },
  { label: "Bold", value: 8 },
  { label: "Extra Bold", value: 10 },
  { label: "Huge", value: 12 },
];
const LINE_TYPES = ["solid", "dashed", "filled"];
const MATH_SYMBOLS = [
  "+",
  "-",
  "x",
  "/",
  "=",
  "sqrt",
  "pi",
  "sin",
  "cos",
  "tan",
  "log",
  "ln",
];

const MAX_HISTORY = 50;

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { onAnalyze, isAnalyzing, onNewDrawing },
  ref
) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(LINE_WIDTHS[1].value);
  const [lineType, setLineType] = useState("solid");
  const [shape, setShape] = useState("free");
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [savedImage, setSavedImage] = useState(null);
  const [textToolActive, setTextToolActive] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [canvasStats, setCanvasStats] = useState({
    strokeCount: 0,
    startTime: null,
    colorsUsed: new Set(),
  });

  // 🔁 Undo/Redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // ✅ Expose methods to parent
  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL("image/png"),
    clear: handleClear,
    drawImageFromData: (imageData) => {
      if (!canvasRef.current || !ctx || !imageData) return;
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
    },
    getStats: () => ({
      strokeCount: canvasStats.strokeCount,
      timeSpent: canvasStats.startTime
        ? Math.round((Date.now() - canvasStats.startTime) / 1000)
        : 0,
      colorsUsed: Array.from(canvasStats.colorsUsed),
    }),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    setCtx(context);

    const resizeCanvas = () => {
      const temp = canvas.toDataURL();
      const img = new Image();
      img.src = temp;
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      const newWidth = window.innerWidth * 0.75;
      const newHeight = window.innerHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
      img.onload = () => {
        context.drawImage(img, 0, 0, oldWidth, oldHeight, 0, 0, newWidth, newHeight);
      };
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // 🔁 Save current state to undo stack
  const saveState = () => {
    if (!ctx || !canvasRef.current) return;
    const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setUndoStack((prev) => {
      const newStack = [...prev, data];
      if (newStack.length > MAX_HISTORY) newStack.shift();
      return newStack;
    });
    setRedoStack([]); // reset redo
  };

  // 🔙 Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const newUndo = [...undoStack];
    const lastState = newUndo.pop();
    setUndoStack(newUndo);
    setRedoStack((prev) => [
      ...prev,
      ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
    ]);
    ctx.putImageData(lastState, 0, 0);
  };

  // 🔁 Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const newRedo = [...redoStack];
    const lastRedo = newRedo.pop();
    setRedoStack(newRedo);
    setUndoStack((prev) => [
      ...prev,
      ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
    ]);
    ctx.putImageData(lastRedo, 0, 0);
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    let x, y;
    if (e.touches) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }
    return { x, y };
  };

  const startDrawing = (e) => {
    if (!ctx || textToolActive) return;
    saveState(); // save before draw
    const pos = getPos(e);
    setStartPos(pos);
    setDrawing(true);
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (shape === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth * 2;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = color;
      ctx.setLineDash(lineType === "dashed" ? [10, 5] : []);
    }

    if (shape === "free" || shape === "eraser") {
      ctx.moveTo(pos.x, pos.y);
    }

    if (["line", "rectangle", "circle"].includes(shape)) {
      setSavedImage(
        ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
      );
    }

    if (shape !== "eraser") {
      setCanvasStats((prev) => ({
        ...prev,
        colorsUsed: new Set([...prev.colorsUsed, color]),
      }));
    }

    if (!canvasStats.startTime) {
      setCanvasStats((prev) => ({ ...prev, startTime: Date.now() }));
    }
  };

  const draw = (e) => {
    if (!drawing || !ctx) return;
    const pos = getPos(e);

    if (shape === "free" || shape === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (["line", "rectangle", "circle"].includes(shape)) {
      if (savedImage) ctx.putImageData(savedImage, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(lineType === "dashed" ? [10, 5] : []);

      if (shape === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (shape === "rectangle") {
        if (lineType === "filled")
          ctx.fillRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        else
          ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (shape === "circle") {
        const radius = Math.sqrt(
          (pos.x - startPos.x) ** 2 + (pos.y - startPos.y) ** 2
        );
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        if (lineType === "filled") ctx.fill();
        else ctx.stroke();
      }
    }

    setCanvasStats((prev) => ({
      ...prev,
      strokeCount: prev.strokeCount + 1,
    }));
  };

  const stopDrawing = () => setDrawing(false);

  const handleClear = () => {
    if (!ctx) return;
    saveState();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setCanvasStats({ strokeCount: 0, startTime: null, colorsUsed: new Set() });
  };

  // 🎹 Keyboard Shortcuts
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "z") handleUndo();
      else if (e.ctrlKey && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) handleRedo();
      else if (e.key.toLowerCase() === "c") handleClear();
      else if (e.key.toLowerCase() === "n") onNewDrawing && onNewDrawing();
      else if (e.key.toLowerCase() === "a") handleAnalyzeClick();
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  });

  const handleAnalyzeClick = () => {
    const imageData = canvasRef.current.toDataURL("image/png");
    onAnalyze(imageData);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col w-full h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 flex-wrap">
          {/* Color buttons */}
          {COLORS.map((c) => (
            <Tooltip key={c}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c
                      ? "border-black dark:border-white"
                      : "border-gray-400"
                  }`}
                  style={{ backgroundColor: c }}
                />
              </TooltipTrigger>
              <TooltipContent>{`Color: ${c}`}</TooltipContent>
            </Tooltip>
          ))}

          {/* Shape Buttons */}
          {SHAPES.map((s) => (
            <Tooltip key={s}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShape(s)}
                  className={`px-2 py-1 rounded border ${
                    shape === s
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {s}
                </button>
              </TooltipTrigger>
              <TooltipContent>{`Tool: ${s}`}</TooltipContent>
            </Tooltip>
          ))}

          {/* Undo / Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleUndo}
                className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800"
              >
                <RotateCcw size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl + Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleRedo}
                className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800"
              >
                <RotateCw size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl + Y)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear
              </button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas (C)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  handleClear();
                  onNewDrawing && onNewDrawing();
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                New Drawing
              </button>
            </TooltipTrigger>
            <TooltipContent>New Drawing (N)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing}
                className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Analyze
              </button>
            </TooltipTrigger>
            <TooltipContent>Analyze (A)</TooltipContent>
          </Tooltip>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="flex-1 border border-gray-300 dark:border-gray-700 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={() => {
            setDrawing(false);
          }}
          onMouseLeave={() => setDrawing(false)}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={() => setDrawing(false)}
        />
      </div>
    </TooltipProvider>
  );
});

export default DrawingCanvas;
