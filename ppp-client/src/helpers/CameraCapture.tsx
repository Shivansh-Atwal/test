// import { useEffect, useRef } from "react";
// import axios from "axios";

// interface CameraProps {
//   contestId: string;
//   userId: string;
// }

// const CameraCapture = ({ contestId, userId }: CameraProps) => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const getStream = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.play();
//         }
//       } catch (err) {
//         console.error("Camera access denied", err);
//       }
//     };

//     getStream();

//     const interval = setInterval(() => {
//       takeScreenshot();
//     }, 60000 + Math.random() * 30000); 

//     return () => {
//       clearInterval(interval);
//       if (videoRef.current?.srcObject) {
//         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const takeScreenshot = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob((blob) => {
//       if (!blob) return;
//       const formData = new FormData();
//       formData.append("image", blob);
//       formData.append("contestId", contestId);
//       formData.append("userId", userId);

//       console.log('Uploading screenshot...')  
//       axios.post("http://localhost:5000/api/screenshot/upload", formData)
//         .catch((err) => console.error("Upload failed", err));
//     }, "image/jpeg");
//   };

//   return (
//     <div style={{ display: "none" }}>
//       <video ref={videoRef} />
//       <canvas ref={canvasRef} />
//     </div>
//   );
// };

// export default CameraCapture;