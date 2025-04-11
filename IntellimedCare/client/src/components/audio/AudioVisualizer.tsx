interface AudioVisualizerProps {
  isActive: boolean;
}

export default function AudioVisualizer({ isActive }: AudioVisualizerProps) {
  // Generate array of bars with random heights for visualizer
  const generateBars = () => {
    const heights = [
      'h-1/6', 'h-1/5', 'h-1/4', 'h-1/3', 'h-2/5', 'h-1/2', 
      'h-3/5', 'h-2/3', 'h-3/4', 'h-4/5', 'h-5/6', 'h-full'
    ];
    
    const delays = Array.from({ length: 36 }, (_, i) => 
      (i * 0.05).toFixed(2) + 's'
    );
    
    return Array.from({ length: 36 }, (_, index) => {
      const randomHeight = heights[Math.floor(Math.random() * heights.length)];
      const delay = delays[index % delays.length];
      const width = index % 4 === 0 ? 'w-1.5' : 'w-1';
      
      // Alternate animation styles for more natural wave appearance
      const animationClass = index % 2 === 0 ? 'animate-wave-pulse' : 'animate-wave-sideway';
      
      return { height: randomHeight, delay, width, animationClass };
    });
  };
  
  const bars = generateBars();

  if (!isActive) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-end space-x-1">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index} 
              className={`w-1 ${index % 3 === 0 ? 'h-2' : 'h-1'} ${index % 2 === 0 ? 'bg-blue-200' : 'bg-teal-200'} rounded-full`}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex items-end w-full justify-center">
        {/* Audio waves visualization */}
        {bars.map((bar, index) => {
          // Create a nice gradient of blue/teal colors
          const colorClass = index % 3 === 0 
            ? 'bg-gradient-to-b from-teal-400 to-blue-500' 
            : index % 3 === 1 
              ? 'bg-gradient-to-b from-blue-400 to-cyan-500'
              : 'bg-gradient-to-b from-cyan-400 to-teal-500';
              
          return (
            <div 
              key={index}
              className={`${bar.width} ${bar.height} mx-0.5 rounded-full ${colorClass} ${bar.animationClass} opacity-80`}
              style={{ 
                animationDelay: bar.delay,
                transformOrigin: 'bottom'
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
}
