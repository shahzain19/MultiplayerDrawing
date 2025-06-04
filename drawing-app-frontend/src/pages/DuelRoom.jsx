import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { BrushCleaning, Download, Redo, Undo } from "lucide-react";

const prompts = [
  "Draw a magical forest",
  "Create a futuristic cityscape",
  "Sketch your dream pet",
  "Design a spaceship",
  "Illustrate your favorite food",
  "Make a surreal landscape",
  "Draw a mythical creature",
];

export default function Room() {
  const canvasRef = useRef(null); // your canvas
  const opponentCanvasRef = useRef(null); // opponent's canvas
  const ctxRef = useRef(null);
  const opponentCtxRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState("brush");
  const [prompt, setPrompt] = useState("");
  const [channel, setChannel] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const sabotageEffects = [
    "shake",
    "invert",
    "erase",
    "smudge",
    "mirror",
    "delay",
    "randomColor",
  ];
  const [cards, setCards] = useState([]);
  const [cardCooldowns, setCardCooldowns] = useState({}); // { cardName: true/false }
  const { code } = useParams();
  const [seconds, setSeconds] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (seconds === 0){
      navigate(`/result/${code}`); 
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount or seconds change
  }, [seconds]);

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
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
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
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    saveToHistory();
  };

  const drawRemoteStroke = ({ x0, y0, x1, y1, color, size }) => {
    const ctx = opponentCtxRef.current;
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

  const activateSabotage = (card) => {
    if (cardCooldowns[card]) return;

    setCardCooldowns((prev) => ({ ...prev, [card]: true }));

    // Delay to simulate activation time (e.g., 1.5s)
    setTimeout(() => {
      channel?.send({
        type: "broadcast",
        event: "sabotage",
        payload: { type: card },
      });
    }, 1500);

    // Reset cooldown after 10 seconds
    setTimeout(() => {
      setCardCooldowns((prev) => ({ ...prev, [card]: false }));
    }, 10000);
  };

  const triggerSabotageEffect = ({ type }) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    switch (type) {
      case "shake":
        let i = 0;
        const interval = setInterval(() => {
          canvas.style.transform = `translate(${Math.random() * 10 - 5}px, ${
            Math.random() * 10 - 5
          }px)`;
          i++;
          if (i > 10) {
            clearInterval(interval);
            canvas.style.transform = "none";
          }
        }, 100);
        break;

      case "invert":
        canvas.style.filter = "invert(1)";
        setTimeout(() => (canvas.style.filter = "none"), 3000);
        break;

      case "erase":
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.clearRect(x, y, 20, 20);
        }
        break;

      case "smudge":
        for (let i = 0; i < 10; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = "#8888";
          ctx.fill();
        }
        break;

      case "mirror":
        const original = handleMouseMove;
        handleMouseMove = (e) => {
          e.nativeEvent.offsetX = canvas.width - e.nativeEvent.offsetX;
          original(e);
        };
        setTimeout(() => (handleMouseMove = original), 5000);
        break;

      case "delay":
        const oldIsDrawing = isDrawing.current;
        isDrawing.current = false;
        setTimeout(() => (isDrawing.current = oldIsDrawing), 2000);
        break;

      case "randomColor":
        const originalColor = color;
        const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"];
        let colorInterval = setInterval(() => {
          setColor(colors[Math.floor(Math.random() * colors.length)]);
        }, 500);
        setTimeout(() => {
          clearInterval(colorInterval);
          setColor(originalColor);
        }, 5000);
        break;

      default:
        break;
    }
  };

  // Init canvas size and context
  useEffect(() => {
    const canvas = canvasRef.current;
    const opponentCanvas = opponentCanvasRef.current;
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight - 100;
    opponentCanvas.width = window.innerWidth / 2;
    opponentCanvas.height = window.innerHeight - 100;

    ctxRef.current = canvas.getContext("2d");
    ctxRef.current.lineCap = "round";
    ctxRef.current.lineJoin = "round";

    opponentCtxRef.current = opponentCanvas.getContext("2d");
    opponentCtxRef.current.lineCap = "round";
    opponentCtxRef.current.lineJoin = "round";

    saveToHistory();
  }, []);

  // Subscribe to socket
  useEffect(() => {
    const ch = supabase.channel(`room-${code}`);
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") console.log(`✅ Joined room: ${code}`);
    });

    ch.on("broadcast", { event: "stroke" }, ({ payload }) => {
      drawRemoteStroke(payload);
    });

    ch.on("broadcast", { event: "sabotage" }, ({ payload }) => {
      triggerSabotageEffect(payload);
    });

    setChannel(ch);

    // Give 2 random sabotage cards
    const chosen = [...sabotageEffects]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    setCards(chosen);
    setCardCooldowns({ [chosen[0]]: false, [chosen[1]]: false });

    return () => {
      ch.unsubscribe();
    };
  }, [code]);

  // Prompt setup
  useEffect(() => {
    async function getOrCreatePrompt() {
      // Try to get prompt first
      let { data, error } = await supabase
        .from("room_prompts")
        .select("prompt")
        .eq("room_code", code)
        .single();

      if (error && error.code !== "PGRST116") {
        // Some unexpected error
        console.error("Prompt error:", error);
        return;
      }

      if (data) {
        setPrompt(data.prompt);
      } else {
        // No prompt found, try insert a new one with upsert to avoid duplicates
        const randomPrompt =
          prompts[Math.floor(Math.random() * prompts.length)];

        const { data: inserted, error: insertError } = await supabase
          .from("room_prompts")
          .upsert([{ room_code: code, prompt: randomPrompt }], {
            onConflict: "room_code",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Prompt insert error:", insertError);
          // If duplicate error, try fetching again (optional)
          const { data: retryData, error: retryError } = await supabase
            .from("room_prompts")
            .select("prompt")
            .eq("room_code", code)
            .single();
          if (retryData) setPrompt(retryData.prompt);
          return;
        }

        if (inserted) setPrompt(inserted.prompt);
      }
    }

    getOrCreatePrompt();
  }, [code]);

  return (
    <div className="w-full h-full">
      <div className="flex items-center px-3 py-2 bg-white shadow-sm">
        <span className="text-[10px] text-gray-400">Duel: {code}</span>
        <div className="flex-grow flex justify-center ml-70">
          <div className="flex flex-col items-center">
            <h2 className="mt-1 yrc text-xl font-bold text-gray-900">
              {prompt}
            </h2>
            <h2 className="yrc mt-1 text-lg font-bold text-gray-900">
              {" "}
              {seconds}s
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 ml-4">
            {cards.map((card) => (
              <button
                key={card}
                disabled={cardCooldowns[card]}
                onClick={() => activateSabotage(card)}
                className={`px-2 py-1 text-xs rounded border ${
                  cardCooldowns[card]
                    ? "opacity-50 bg-gray-200"
                    : "bg-red-100 hover:bg-red-200"
                }`}
              >
                🔥 {card}
              </button>
            ))}
          </div>

          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="bg-transparent text-gray-600 text-sm outline-none"
          >
            <option value="brush">🖌️</option>
            <option value="eraser">🧽</option>
          </select>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6"
          />
          <input
            type="range"
            min="1"
            max="30"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24 h-1 accent-blue-600"
          />
          <button onClick={undo}>
            <Undo className="inline" />
          </button>
          <button onClick={redo}>
            <Redo className="inline" />
          </button>
          <button onClick={clearCanvas}>
            <BrushCleaning className="inline text-red-400" />
          </button>
          <button onClick={download}>
            <Download className="inline text-blue-500" />
          </button>
        </div>
      </div>

      <div className="flex">
        <canvas
          ref={opponentCanvasRef}
          className="bg-white border border-gray-300 shadow-md w-1/2"
          style={{ pointerEvents: "none" }}
        />
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-white border border-gray-300 shadow-md  w-1/2"
        />
      </div>
    </div>
  );
}
