import { useState, useRef, useEffect } from 'react';

export default function PhysicsGame() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [carPosition, setCarPosition] = useState({ x: 50, y: 50 });
  const [carAngle, setCarAngle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pathIndex, setPathIndex] = useState(0);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    clearCanvas();
  }, []);

  // Draw the path and car during simulation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    clearCanvas();
    
    // Draw the path
    if (path.length > 0) {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
    
    // Draw the car
    drawCar(ctx, carPosition.x, carPosition.y, carAngle);
  }, [path, carPosition, carAngle]);

  // Animation loop for car movement
  useEffect(() => {
    if (!isSimulating || path.length < 2 || pathIndex >= path.length - 1) return;
    
    const interval = setInterval(() => {
      if (pathIndex < path.length - 1 && speed > 0) {
        // Calculate angle to next point
        const nextPoint = path[pathIndex + 1];
        const dx = nextPoint.x - carPosition.x;
        const dy = nextPoint.y - carPosition.y;
        const targetAngle = Math.atan2(dy, dx);
        
        // Calculate distance to next point
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < speed) {
          // Move to next path point
          setCarPosition(nextPoint);
          setPathIndex(prev => prev + 1);
        } else {
          // Move toward next point based on speed
          const newX = carPosition.x + Math.cos(targetAngle) * speed;
          const newY = carPosition.y + Math.sin(targetAngle) * speed;
          setCarPosition({ x: newX, y: newY });
          setCarAngle(targetAngle);
        }
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isSimulating, path, pathIndex, speed, carPosition]);

  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Reset line style for drawing
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
  };

  // Draw a simple car representation
  const drawCar = (ctx, x, y, angle) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Car body
    ctx.fillStyle = 'red';
    ctx.fillRect(-15, -10, 30, 20);
    
    // Car wheels
    ctx.fillStyle = 'black';
    ctx.fillRect(-12, -12, 8, 4);
    ctx.fillRect(-12, 8, 8, 4);
    ctx.fillRect(4, -12, 8, 4);
    ctx.fillRect(4, 8, 8, 4);
    
    ctx.restore();
  };

  // Handle mouse events for drawing
  const startDrawing = (e) => {
    if (isSimulating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setPath([{ x, y }]);
    setCarPosition({ x, y });
  };

  const draw = (e) => {
    if (!isDrawing || isSimulating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPath(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Handle controls
  const startSimulation = () => {
    if (path.length > 1) {
      setIsSimulating(true);
      setPathIndex(0);
      setCarPosition(path[0]);
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSpeed(0);
    if (path.length > 0) {
      setCarPosition(path[0]);
    } else {
      setCarPosition({ x: 50, y: 50 });
    }
    setPathIndex(0);
  };

  const clearPath = () => {
    setPath([]);
    resetSimulation();
    clearCanvas();
  };

  const accelerate = () => {
    setSpeed(prev => Math.min(prev + 1, 10));
  };

  const brake = () => {
    setSpeed(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Physics Car Simulator</h1>
      
      <div className="relative mb-4 border-2 border-gray-300 rounded">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      
      <div className="flex flex-col w-full max-w-md gap-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={startSimulation} 
            disabled={isSimulating || path.length < 2}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Start
          </button>
          
          <button 
            onClick={resetSimulation}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
          
          <button 
            onClick={clearPath}
            disabled={isSimulating}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Clear Path
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button 
              onClick={brake}
              disabled={!isSimulating || speed <= 0}
              className="bg-red-500 hover:bg-red-600 text-white text-lg px-6 py-3 rounded disabled:bg-gray-300"
            >
              Brake
            </button>
            
            <button 
              onClick={accelerate}
              disabled={!isSimulating || speed >= 10}
              className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded disabled:bg-gray-300"
            >
              Accelerate
            </button>
          </div>
          
          <div className="text-xl">
            Speed: {speed}
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded mt-4">
          <h2 className="font-bold mb-2">Instructions:</h2>
          <ol className="list-decimal ml-6">
            <li>Draw a path on the grid by clicking and dragging</li>
            <li>Press Start to begin the simulation</li>
            <li>Use Accelerate and Brake buttons to control the car's speed</li>
            <li>Press Reset to restart from the beginning</li>
            <li>Press Clear Path to erase and start over</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
