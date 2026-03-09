import React, { useRef, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Game variables
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    const ballRadius = 10;

    let paddle1Y = canvas.height / 2 - 50;
    let paddle2Y = canvas.height / 2 - 50;
    const paddleWidth = 10;
    const paddleHeight = 100;

    function draw() {
      // Clear canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ball
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw paddles
      ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
      ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);
    }

    function update() {
      // Move ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Bounce off top/bottom
      if (ballY < ballRadius || ballY > canvas.height - ballRadius) {
        ballSpeedY = -ballSpeedY;
      }

      // Bounce off paddles
      if (ballX < paddleWidth + ballRadius && ballY > paddle1Y && ballY < paddle1Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
      }
      if (ballX > canvas.width - paddleWidth - ballRadius && ballY > paddle2Y && ballY < paddle2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
      }

      // Reset ball if out of bounds
      if (ballX < 0 || ballX > canvas.width) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
      }
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>ft_transcendence - Pong Demo</h1>
        <canvas ref={canvasRef} width={800} height={400} className="pong-canvas" />
        <p>Use keyboard controls to play (coming soon!)</p>
      </header>
    </div>
  );
}

export default App;
