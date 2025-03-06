import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';

const Planet = ({ position, color, size, name }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, size + 1, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

const StudyUniverse = () => {
  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 0, 15] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
          
          {/* Sun */}
          <Planet position={[0, 0, 0]} color="#FFD700" size={2} name="Study Hub" />
          
          {/* Planets */}
          <Planet position={[5, 0, 0]} color="#4CAF50" size={0.8} name="Web Dev" />
          <Planet position={[-5, 0, 0]} color="#2196F3" size={0.8} name="Data Structures" />
          <Planet position={[0, 5, 0]} color="#9C27B0" size={0.8} name="Physics" />
          <Planet position={[0, -5, 0]} color="#FF5722" size={0.8} name="Mathematics" />
          
          {/* Orbits */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[5, 0.1, 16, 100]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[7, 0.1, 16, 100]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Suspense>
      </Canvas>
      
      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Your Study Universe
          </h1>
          <p className="text-xl text-white opacity-80 max-w-2xl">
            Explore different study domains and connect with peers who share your interests.
            Each planet represents a different subject area where you can collaborate and learn together.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyUniverse; 