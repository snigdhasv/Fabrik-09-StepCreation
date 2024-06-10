import {
  CameraControls,
  Dodecahedron,
  Environment,
  Grid,
  MeshDistortMaterial,
  RenderTexture,
} from "@react-three/drei";

import { useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { homeAtom, slideAtom } from "./Overlay";
import { Scene } from "./Scene";
import {dispAtom} from "./Overlay"


//Array of three scenes with three different models
export const scenes = [
  {
      path : "/models/mcqueen.glb",
      mainColor : "#FFAE9E",
      name : "Lightning McQueen",
      description : "Focus. Speed. I am Speed. One winner, forty two losers. I eat losers for breakfast.",
  },
  {
      path : "/models/cruz.glb",
      mainColor : "#FCEE95",
      name : "Cruz Ramirez",
      description : "I am so excited that I get to train you. These young guys are great and all, but I like a challenge.",
  },
  {
      path : "/models/storm.glb",
      mainColor : "#9BC7F6",
      name : "Jackson Storm",
      description : "You have no idea what a pleasure it is for me to finally beat you.",
  },
];

let sphere = 0;

const CameraHandler = ({sphere, slideDistance }) => {
  
  //const [sphere, setSphere] = useState(1);
  const viewport = useThree((state) => state.viewport);
  const CameraControlsRef = useRef();
  const [slide,setSlide] = useAtom(slideAtom); //slide value gives the slide number
  const lastSlide = useRef(0);
  const [home,setHome] = useAtom(homeAtom);
  const [homeDisp, setHomeDisp] = useAtom(dispAtom);


  const { dollyDistance } = useControls({
    dollyDistance: {
      value: 10,
      min: 0,
      max: 50,
    },
  });

  const moveToSlide = async () => {
    //zoom out
    await CameraControlsRef.current.setLookAt(
      lastSlide.current * (viewport.width + slideDistance),
      3,
      dollyDistance,
      lastSlide.current * (viewport.width + slideDistance),
      0,
      0,
      true
    );
    //move camera on x-axis
    await CameraControlsRef.current.setLookAt(
      (slide + 1) * (viewport.width + slideDistance),
      1,
      dollyDistance,
      slide * (viewport.width + slideDistance),
      0,
      0,
      true
    );
    //go infront of next slide on y axis
    await CameraControlsRef.current.setLookAt(
      slide * (viewport.width + slideDistance),
      0,
      5,
      slide * (viewport.width + slideDistance),
      0,
      0,
      true
    );
  };

  const panOut = async()=>{

    await CameraControlsRef.current.setLookAt(
      (viewport.width * (scenes.length-1) + slideDistance*(scenes.length-1) )/2, //look at center of the three scenes
      viewport.height/2, //y position is also centered 
      30, //pan out on the z axis
      (viewport.width * (scenes.length-1) + slideDistance*(scenes.length-1))/2, //we're still looking at the center of three slides 
      0,
      0,
      true
    );
  };

  const handleSphereClick = () =>{
    sphereSlidePan();
    setHome(false);
    setHomeDisp(true);
    setSlide(sphere);
    sphere=0;
  };

  const panIn = async()=>{

    await CameraControlsRef.current.setLookAt(
      slide * (viewport.width + slideDistance),
      0,
      30,
      slide * (viewport.width + slideDistance),
      0,
      0,
      true
    );
    await CameraControlsRef.current.setLookAt(
      slide * (viewport.width + slideDistance),
      0,
      5,
      slide * (viewport.width + slideDistance),
      0,
      0,
      true
    );
  };

  const sphereSlidePan = async() => {
    await CameraControlsRef.current.setLookAt(
      (viewport.width * (scenes.length-1) + slideDistance*(scenes.length-1) )/2,
      0,
      30,
      sphere * (viewport.width + slideDistance),
      0,
      0,
      true
    );
    await CameraControlsRef.current.setLookAt(
      sphere * (viewport.width + slideDistance),
      0,
      5,
      sphere * (viewport.width + slideDistance),
      0,
      0,
      true
    );
  }

  useEffect(() => {
    const resetTimeout = setTimeout(() => {
      if(home){
        panOut();
      } else{
        panIn();
      }
    }, 1000);
    return () => clearTimeout(resetTimeout);
  }, [slide, home]);

  useEffect(()=>{
    if(home) return;
    //when we open the applicaiton we don't want to animate so we check if we're at home or on same slide if it's a different slide we call moveToSlide and assign lastSlide.current to slide
    if(lastSlide.current===slide){
      return;
    }
    moveToSlide();
    lastSlide.current=slide;
  },[slide,home]);

  useEffect(() => {
    setTimeout(()=>{
      handleSphereClick();
      
    },1500);
  },[sphere]);

  return (
    <CameraControls
      ref={CameraControlsRef}
      touches={{
        one: 0,
        two: 0,
        three: 0,
      }}
      mouseButtons={{
        left: 0,
        middle: 0,
        right: 0,
      }}
    />
  );
};



export const Experience = () => {
  //const [sphere, setSphere] = useState(1);
  const viewport = useThree((state) => state.viewport);
  const { slideDistance } = useControls({
    slideDistance: {
      value: 1,
      min: 0,
      max: 10,
    },
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <Environment preset={"city"} />
      <CameraHandler slideDistance={slideDistance} sphere={sphere} />
      <group>
        {scenes.map((scene, index) => (
          <mesh
            key={index}
            position-x={index * (viewport.width + slideDistance)}
            position-y={viewport.height / 2 + 1.5}
            onClick={() => {sphere = index}}
          >
            <sphereGeometry args={[0.7, 64, 64]} />
            <MeshDistortMaterial color={scene.mainColor} speed={3} />
          </mesh>
        ))}
      </group>
      <Grid
        position-y={-viewport.height / 2}
        sectionSize={1}
        sectionColor={"red"}
        sectionThickness={1}
        cellSize={0.5}
        cellColor={"#6f6f6f"}
        cellThickness={0.6}
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
      />

      {/* map through all scenes to render a component for each of them */}
      {scenes.map((scene, index) => (
        <mesh
          key={index}
          position={[index * (viewport.width + slideDistance), 0, 0]}
        >
          <planeGeometry args={[viewport.width, viewport.height]} />
          <meshBasicMaterial toneMapped={false}>
            <RenderTexture attach="map"> 
              <Scene {...scene} />
            </RenderTexture>
          </meshBasicMaterial>
        </mesh>
      ))}
    </>
  );
};
