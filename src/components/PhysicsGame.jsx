import { useState, useRef, useEffect } from 'react';

export default function PhysicsGame() {
  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [carPosition, setCarPosition] = useState({ x: 50, y: 50 });
  const [carAngle, setCarAngle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pathIndex, setPathIndex] = useState(0);
  
  // Metrics
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);

  // Initialize main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    clearCanvas();
  }, []);

  // Initialize graph canvas
  useEffect(() => {
    if (isSimulating && graphCanvasRef.current) {
      drawSpeedTimeGraph();
    }
  }, [speedHistory, isSimulating]);

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

  // Timer for elapsed time
  useEffect(() => {
    let interval;
    
    if (isSimulating && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        setElapsedTime((now - startTime) / 1000); // Convert to seconds
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isSimulating, startTime]);

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
        
        // Update max speed
        if (speed > maxSpeed) {
          setMaxSpeed(speed);
        }
        
        // Update speed history for average calculation and graph
        const timePoint = (Date.now() - startTime) / 1000; // in seconds
        setSpeedHistory(prev => [...prev, { time: timePoint, speed: speed }]);
        
        if (distance < speed) {
          // Move to next path point
          setCarPosition(nextPoint);
          setPathIndex(prev => prev + 1);
          
          // Update total distance traveled
          setDistanceTraveled(prev => prev + distance);
        } else {
          // Move toward next point based on speed
          const newX = carPosition.x + Math.cos(targetAngle) * speed;
          const newY = carPosition.y + Math.sin(targetAngle) * speed;
          setCarPosition({ x: newX, y: newY });
          setCarAngle(targetAngle);
          
          // Update total distance traveled
          setDistanceTraveled(prev => prev + speed);
        }
        
        // Update average speed
        if (elapsedTime > 0) {
          setAverageSpeed(distanceTraveled / elapsedTime);
        }
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isSimulating, path, pathIndex, speed, carPosition, distanceTraveled, elapsedTime, maxSpeed, startTime]);

  
  // Draw speed-time graph
  const drawSpeedTimeGraph = () => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // X-axis (Time)
    ctx.moveTo(30, height - 30);
    ctx.lineTo(width - 20, height - 30);
    
    // Y-axis (Speed)
    ctx.moveTo(30, height - 30);
    ctx.lineTo(30, 20);
    ctx.stroke();
    
    // Add axis labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText('Time (s)', width / 2, height - 10);
    
    // Y-axis label
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Speed', 0, 0);
    ctx.restore();
    
    // Draw X-axis ticks and labels
    const maxTime = Math.max(10, elapsedTime); // At least 10 seconds or current elapsed time
    const timeStep = Math.ceil(maxTime / 5); // 5 ticks on x-axis
    
    for (let i = 0; i <= maxTime; i += timeStep) {
      const x = 30 + ((width - 50) * i) / maxTime;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, height - 30);
      ctx.lineTo(x, height - 25);
      ctx.stroke();
      
      // Draw label
      ctx.fillText(i.toString(), x, height - 15);
    }
    
    // Draw Y-axis ticks and labels
    const maxSpeedOnGraph = Math.max(20, maxSpeed); // At least 20 or current max speed
    const speedStep = maxSpeedOnGraph / 5; // 5 ticks on y-axis
    
    for (let i = 0; i <= maxSpeedOnGraph; i += speedStep) {
      const y = height - 30 - ((height - 50) * i) / maxSpeedOnGraph;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(35, y);
      ctx.stroke();
      
      // Draw label
      ctx.textAlign = 'right';
      ctx.fillText(i.toFixed(1), 25, y + 4);
    }
    
    // Plot the speed history
    if (speedHistory.length > 1) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < speedHistory.length; i++) {
        const point = speedHistory[i];
        const x = 30 + ((width - 50) * point.time) / maxTime;
        const y = height - 30 - ((height - 50) * point.speed) / maxSpeedOnGraph;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
    
    // Draw grid lines (light gray)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= maxSpeedOnGraph; i += speedStep) {
      const y = height - 30 - ((height - 50) * i) / maxSpeedOnGraph;
      
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= maxTime; i += timeStep) {
      const x = 30 + ((width - 50) * i) / maxTime;
      
      ctx.beginPath();
      ctx.moveTo(x, height - 30);
      ctx.lineTo(x, 20);
      ctx.stroke();
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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

  // Calculate total path length
  const calculatePathLength = () => {
    if (path.length < 2) return 0;
    
    let totalLength = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i-1].x;
      const dy = path[i].y - path[i-1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    
    return totalLength;
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
      setStartTime(Date.now());
      setDistanceTraveled(0);
      setElapsedTime(0);
      setMaxSpeed(0);
      setAverageSpeed(0);
      setSpeedHistory([]);
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
    // Keep the metrics for review
  };

  const clearPath = () => {
    setPath([]);
    resetSimulation();
    clearCanvas();
    setDistanceTraveled(0);
    setElapsedTime(0);
    setMaxSpeed(0);
    setAverageSpeed(0);
    setSpeedHistory([]);
    
    // Clear graph
    if (graphCanvasRef.current) {
      const ctx = graphCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, graphCanvasRef.current.width, graphCanvasRef.current.height);
    }
  };

  const accelerate = () => {
    setSpeed(prev => Math.min(prev + 1, 20)); // Increased max speed to 20
  };

  const brake = () => {
    setSpeed(prev => Math.max(prev - 1, 0));
  };

  // Format time as mm:ss.ms
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Physics Car Simulation</h1>
      <p className="text-center text-gray-400">
        Draw a path on the canvas, simulate the car’s motion, and analyze speed-time data.
      </p>
  
      <div className="sim-container">
        {/* Left Side */}
        <div className="sim-left">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            className="border border-gray-400 w-full rounded-md shadow-md"
          />
  
          {/* Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={startSimulation} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">Start</button>
            <button onClick={resetSimulation} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded">Reset</button>
            <button onClick={clearPath} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">Clear</button>
            <button onClick={accelerate} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Accelerate</button>
            <button onClick={brake} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded">Brake</button>
          </div>
            {/* Current Speed */}
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <h2 className="text-xl font-semibold text-blue-700 mb-1">Current Speed</h2>
            <div className="text-4xl font-bold text-blue-600">{speed.toFixed(1)}</div>
            <div className="text-gray-500">pixels/frame</div>
          </div>


        </div>
  
        {/* Right Side */}
        <div className="sim-right">
        <div>
            {/* Graph */}
            <h2 className="text-xl font-semibold mb-2 text-center">Speed-Time Graph</h2>
            <canvas
              ref={graphCanvasRef}
              width={600}
              height={300}
              className="border border-gray-300 w-full rounded-md shadow"
            />
          </div>

  
          {/* Metrics */}
          <div className="bg-white rounded-md shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Metrics</h2>
            <table className="table-auto w-full text-sm text-left">
              <tbody>
                <tr><td className="font-semibold">Elapsed Time:</td><td>{elapsedTime.toFixed(2)} s</td></tr>
                <tr><td className="font-semibold">Distance Traveled:</td><td>{distanceTraveled.toFixed(2)} px</td></tr>
                <tr><td className="font-semibold">Current Speed:</td><td>{speed.toFixed(2)} px/frame</td></tr>
                <tr><td className="font-semibold">Max Speed:</td><td>{maxSpeed.toFixed(2)} px/frame</td></tr>
                <tr><td className="font-semibold">Average Speed:</td><td>{averageSpeed.toFixed(2)} px/s</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
  
}