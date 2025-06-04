import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { BrushCleaning, Download, Redo, Undo } from "lucide-react";

export default function Room() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState("brush");
  const [prompt, setPrompt] = useState("");
  const { code } = useParams();
  const [channel, setChannel] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [hue, setHue] = useState(0);

  let lastPoint = null;

  const lastPos = useRef({ x: 0, y: 0 });

  // --- Draw Functions ---
  function drawSmoothLine(ctx, x, y) {
    if (!lastPoint) {
      lastPoint = { x, y };
      return;
    }

    const midPointX = (lastPoint.x + x) / 2;
    const midPointY = (lastPoint.y + y) / 2;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midPointX, midPointY);
    ctx.stroke();

    lastPoint = { x, y };
  }

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    setHistory((prev) => [...prev, canvas.toDataURL()]);
    setRedoStack([]);
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    lastPos.current = { x: offsetX, y: offsetY };

    if (tool === "fill") {
      const ctx = ctxRef.current;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (tool === "rectangle" || tool === "circle") {
      saveToHistory();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || tool === "fill") return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;

    let strokeColor = color;

    if (tool === "rainbowBrush") {
      strokeColor = `hsl(${hue}, 100%, 50%)`;
      setHue((h) => (h + 5) % 360);
    }

    if (tool === "brush" || tool === "eraser" || tool === "rainbowBrush") {
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : strokeColor;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      ctx.closePath();

      channel?.send({
        type: "broadcast",
        event: "stroke",
        payload: {
          x0: lastPos.current.x,
          y0: lastPos.current.y,
          x1: offsetX,
          y1: offsetY,
          color: tool === "eraser" ? "#ffffff" : color,
          size,
        },
      });

      lastPos.current = { x: offsetX, y: offsetY };
    }
  };

  const handleMouseUp = (e) => {
    isDrawing.current = false;
    saveToHistory();
  };

  const drawRemoteStroke = ({ x0, y0, x1, y1, color, size }) => {
    const ctx = ctxRef.current;

    const prevColor = ctx.strokeStyle;
    const prevSize = ctx.lineWidth;

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = prevColor;
    ctx.lineWidth = prevSize;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const last = history[history.length - 1];
    const img = new Image();
    img.src = last;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    setRedoStack((r) => [...r, canvas.toDataURL()]);
    setHistory((h) => h.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const last = redoStack[redoStack.length - 1];
    const img = new Image();
    img.src = last;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    setHistory((h) => [...h, canvas.toDataURL()]);
    setRedoStack((r) => r.slice(0, -1));
  };

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // --- INIT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    saveToHistory();
  }, []);

  useEffect(() => {
    const ch = supabase.channel(`room-${code}`);
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`✅ Joined room: ${code}`);
      }
    });

    ch.on("broadcast", { event: "stroke" }, ({ payload }) => {
      drawRemoteStroke(payload);
    });

    setChannel(ch);

    return () => {
      ch.unsubscribe();
    };
  }, [code]);

  return (
    <div className="w-full h-full">
      <div className="flex items-center px-3 py-2 bg-white justify-between shadow-sm">
        {/* Left: Room Code */}
        <span className="text-[10px] text-gray-400">Room: {code}</span>

        {/* Right: Tools */}
        <div className="flex items-center gap-2">
          {/* Tool */}
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="bg-transparent text-gray-600 text-sm outline-none"
          >
            <option value="brush">🖌️</option>
            <option value="eraser">🧽</option>
            <option value="rainbowBrush">🌈</option>
          </select>

          {/* Color */}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 p-0 border-none cursor-pointer"
          />

          {/* Size */}
          <input
            type="range"
            min="1"
            max="30"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24 h-1 accent-blue -600"
          />

          {/* Action Buttons */}
          <button onClick={undo} className="text-gray-600 text-xs">
            <Undo className="inline" />
          </button>
          <button onClick={redo} className="text-gray-600 text-xs">
            <Redo className="inline" />
          </button>
          <button onClick={clearCanvas} className="text-red-400 text-xs">
            <BrushCleaning className="inline" />
          </button>
          <button onClick={download} className="text-blue-500 text-xs">
            <Download className="inline" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const rect = canvasRef.current.getBoundingClientRect();
          handleMouseDown({
            nativeEvent: {
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top,
            },
          });
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const rect = canvasRef.current.getBoundingClientRect();
          handleMouseMove({
            nativeEvent: {
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top,
            },
          });
        }}
        onTouchEnd={handleMouseUp}
        className="bg-white cursor-crosshair w-full h-[calc(100vh-100px)] touch-none"
      />
    </div>
  );
}
