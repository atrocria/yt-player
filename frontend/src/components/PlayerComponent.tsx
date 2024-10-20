interface PlayerProps {
  isPlaying: boolean;
}

const PlayerComponent: React.FC<PlayerProps> = ({ isPlaying }) => {
  return <div>{isPlaying ? <p>Playing...</p> : <p>Paused</p>}</div>;
};

export default PlayerComponent;
