import { Link } from 'react-router-dom';

export default function Dashboard() {
  const games = [
    {
      id: 1,
      name: 'Physics Car Simulation',
      path: '/car-sim',
      thumbnail: '', //  URL
      description: 'Experience realistic car physics and challenging game.',
    },
    {
      id: 2,
      name: 'Another Cool Game',
      path: '/another-game',
      thumbnail: 'src/assests/Physicsgame.jpg', //  URL
      description: 'Explore a new and exciting gaming adventure!',
    },
    {
      id: 2,
      name: 'Another Cool Game',
      path: '/another-game',
      thumbnail: '', //  URL
      description: 'Explore a new and exciting gaming adventure!',
    },
    // Add more games here
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Game Dashboard</h1>

      <div className="game-grid">
        {games.map((game) => (
          <Link
            key={game.id}
            to={game.path}
            className="game-card"
          >
            <div className="thumbnail-container">
              <img
                src={game.thumbnail}
                alt={game.name}
                className="thumbnail"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '../src/assests/Physicsgame.jpg'; // Use a placeholder image
                }}
              />
            </div>
            <div className="game-info">
              <h2 className="game-name">{game.name}</h2>
              <h4 className="game-description">{game.description}</h4>
            </div>
            <div className="play-overlay">
              <span className="play-text">Play Now</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}