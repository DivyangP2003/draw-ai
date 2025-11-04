"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TextTool from "@/components/text-tool";
import { BarChart3 } from "lucide-react";

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
  

  // ✅ Expose methods to parent (for saving/loading)
  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL("image/png"),
    clear: () => {
      if (ctx)
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    },
    drawImageFromData: (imageData) => {
      if (!canvasRef.current || !ctx || !imageData) return;

      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        // ✅ Double-check again after image loads
        if (!canvasRef.current || !ctx) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          img,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      };
    },

    // ✅ expose stats to parent
    getStats: () => {
      return {
        strokeCount: canvasStats.strokeCount,
        timeSpent: canvasStats.startTime
          ? Math.round((Date.now() - canvasStats.startTime) / 1000)
          : 0,
        colorsUsed: Array.from(canvasStats.colorsUsed),
      };
    },
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
        context.drawImage(
          img,
          0,
          0,
          oldWidth,
          oldHeight,
          0,
          0,
          newWidth,
          newHeight
        );
      };
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

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
        ctx.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        )
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
          ctx.fillRect(
            startPos.x,
            startPos.y,
            pos.x - startPos.x,
            pos.y - startPos.y
          );
        else
          ctx.strokeRect(
            startPos.x,
            startPos.y,
            pos.x - startPos.x,
            pos.y - startPos.y
          );
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

  const handleAddText = (textOptions) => {
    setTextToolActive(true);
    const canvas = canvasRef.current;
    canvas.style.cursor = "crosshair";

    const handleCanvasClick = (e) => {
      if (!ctx) return;
      const pos = getPos(e);
      ctx.fillStyle = textOptions.color;
      ctx.font = `${textOptions.fontSize}px ${textOptions.fontFamily}`;
      ctx.fillText(textOptions.text, pos.x, pos.y);
      canvas.removeEventListener("click", handleCanvasClick);
      setTextToolActive(false);
    };

    canvas.addEventListener("click", handleCanvasClick);
  };

  const handleAnalyzeClick = () => {
    const imageData = canvasRef.current.toDataURL("image/png");
    onAnalyze(imageData);
  };

  const handleClear = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setCanvasStats({
      strokeCount: 0,
      startTime: null,
      colorsUsed: new Set(),
    });
  };

  const handleDropSymbol = (symbol, e) => {
    if (!ctx) return;
    const pos = getPos(e);
    ctx.fillStyle = color;
    ctx.font = `${lineWidth * 7}px Arial`;
    ctx.fillText(symbol, pos.x, pos.y);
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-full border-2 ${
              color === c
                ? "border-black dark:border-white"
                : "border-gray-300 dark:border-gray-600"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        {SHAPES.map((s) => (
          <button
            key={s}
            onClick={() => setShape(s)}
            className={`px-2 py-1 rounded border ${
              shape === s
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
        <select
          value={lineWidth}
          onChange={(e) => setLineWidth(Number.parseInt(e.target.value))}
          className="px-2 py-1 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
          {LINE_WIDTHS.map((lw) => (
            <option key={lw.label} value={lw.value}>
              {lw.label}
            </option>
          ))}
        </select>
        <select
          value={lineType}
          onChange={(e) => setLineType(e.target.value)}
          className="px-2 py-1 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
          {LINE_TYPES.map((lt) => (
            <option key={lt} value={lt}>
              {lt}
            </option>
          ))}
        </select>
        <TextTool onAddText={handleAddText} isActive={textToolActive} />
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className={`px-3 py-1 rounded border transition ${
            showAnalytics
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          }`}
        >
          <BarChart3 size={18} />
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>

        <button
          onClick={() => {
            if (!ctx || !canvasRef.current) return;
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            setCanvasStats({
              strokeCount: 0,
              startTime: null,
              colorsUsed: new Set(),
            });
            // 🧠 Inform parent to reset analysis, title, etc.
            if (onNewDrawing) onNewDrawing();
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Drawing
        </button>

        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Analyze
        </button>
      </div>

      {/* Stats bar */}
      {showAnalytics && (
        <div className="bg-blue-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-3">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold">Strokes:</span>{" "}
              {canvasStats.strokeCount}
            </div>
            <div>
              <span className="font-semibold">Time Spent:</span>{" "}
              {canvasStats.startTime
                ? Math.round((Date.now() - canvasStats.startTime) / 1000)
                : 0}
              s
            </div>
            <div>
              <span className="font-semibold">Colors Used:</span>{" "}
              {canvasStats.colorsUsed.size}
            </div>
          </div>
        </div>
      )}

      {/* Math symbols */}
      <div className="flex gap-2 p-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex-wrap">
        {MATH_SYMBOLS.map((s) => (
          <div
            key={s}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("symbol", s);
              e.currentTarget.classList.add("scale-125", "shadow-lg");
            }}
            onDragEnd={(e) =>
              e.currentTarget.classList.remove("scale-125", "shadow-lg")
            }
            className="px-2 py-1 border rounded bg-white dark:bg-gray-900 cursor-grab hover:bg-gray-300 dark:hover:bg-gray-700 transition-transform duration-150"
          >
            {s}
          </div>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 border border-gray-300 dark:border-gray-700 cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onDrop={(e) => {
          e.preventDefault();
          const symbol = e.dataTransfer.getData("symbol");
          if (symbol) handleDropSymbol(symbol, e);
        }}
        onDragOver={(e) => e.preventDefault()}
      />
    </div>
  );
});

export default DrawingCanvas;
