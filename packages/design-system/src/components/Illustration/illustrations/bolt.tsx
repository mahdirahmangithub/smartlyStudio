import type { SVGProps } from "react";

export function Bolt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="-4 -4 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      {...props}
    >
      <style>{`
        @keyframes bolt-float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes bolt-float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-3deg); }
        }
        @keyframes bolt-float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes bolt-float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-2deg); }
        }
        @keyframes bolt-float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(2.5deg); }
        }
        @keyframes bolt-float-6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-3deg); }
        }
        @keyframes bolt-float-7 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(1.5deg); }
        }
        .bolt-f1 { animation: bolt-float-1 3s ease-in-out infinite; animation-delay: 0s; }
        .bolt-f2 { animation: bolt-float-2 3.4s ease-in-out infinite; animation-delay: 0.4s; }
        .bolt-f3 { animation: bolt-float-3 2.8s ease-in-out infinite; animation-delay: 0.8s; }
        .bolt-f4 { animation: bolt-float-4 3.2s ease-in-out infinite; animation-delay: 1.2s; }
        .bolt-f5 { animation: bolt-float-5 3.6s ease-in-out infinite; animation-delay: 0.6s; }
        .bolt-f6 { animation: bolt-float-6 2.6s ease-in-out infinite; animation-delay: 1.0s; }
        .bolt-f7 { animation: bolt-float-7 3.8s ease-in-out infinite; animation-delay: 0.2s; }
      `}</style>

      {/* Orange circle — bottom */}
      <g className="bolt-f1">
        <path
          d="M45.2256 73.3333C47.2728 73.3333 48.9325 71.7009 48.9325 69.6873C48.9325 67.6736 47.2728 66.0412 45.2256 66.0412C43.1783 66.0412 41.5187 67.6736 41.5187 69.6873C41.5187 71.7009 43.1783 73.3333 45.2256 73.3333Z"
          fill="#FB7F37"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>

      {/* Blue hexagon — left */}
      <g className="bolt-f2">
        <path
          d="M13.5301 28.4949L10.9114 25.345L12.3747 21.5391L16.4572 20.8832L19.0763 24.0331L17.6126 27.839L13.5301 28.4949Z"
          fill="#7AC1FF"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>

      {/* Blue circle — top right */}
      <g className="bolt-f3">
        <path
          d="M64.2735 14.6346C66.5104 14.6346 68.3239 12.8509 68.3239 10.6506C68.3239 8.45033 66.5104 6.66667 64.2735 6.66667C62.0366 6.66667 60.2231 8.45033 60.2231 10.6506C60.2231 12.8509 62.0366 14.6346 64.2735 14.6346Z"
          fill="#2B7FEE"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Pink circle — right */}
      <g className="bolt-f4">
        <path
          d="M71.0292 31.2694C72.3019 31.2694 73.3332 30.2547 73.3332 29.0031C73.3332 27.7515 72.3019 26.7368 71.0292 26.7368C69.7564 26.7368 68.7251 27.7515 68.7251 29.0031C68.7251 30.2547 69.7564 31.2694 71.0292 31.2694Z"
          fill="#F179BD"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Small orange circle — left */}
      <g className="bolt-f5">
        <path
          d="M8.77632 41.6666C9.94183 41.6666 10.886 40.7339 10.886 39.5833C10.886 38.4327 9.94183 37.5 8.77632 37.5C7.61081 37.5 6.66663 38.4327 6.66663 39.5833C6.66663 40.7339 7.61081 41.6666 8.77632 41.6666Z"
          fill="#FFA96B"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Purple triangle — top center */}
      <g className="bolt-f6">
        <path
          d="M40.7149 11.0255L37.7266 12.7C36.7938 13.2221 36.8274 14.4785 37.7843 14.9608L40.8543 16.5048C41.8136 16.987 42.9796 16.3322 42.9531 15.328L42.869 12.1094C42.8425 11.1051 41.6453 10.5034 40.7125 11.0255H40.7149Z"
          fill="#C382FC"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Origami bird — center */}
      <g className="bolt-f7">
        <path d="M58.8689 38.8553L50.2408 43.3359L48.3897 40.8848L62.6659 33.097L58.8689 38.8553Z" fill="#9138EA" />
        <path d="M62.6699 33.0955L48.3945 40.8831L57.8357 53.4058L23.3434 62.5107L18.6228 56.7026L33.1193 49.0135L23.6781 36.4908L58.2617 27.4069L62.6699 33.0955Z" fill="#AE57FA" />
        <path d="M23.3783 62.4999L19.881 67.8025L54.1604 58.9008L57.8375 53.4031L23.3783 62.4999Z" fill="#9138EA" />
        <path d="M20.0508 42.0517L23.68 36.4925L33.1218 49.0145L27.5911 51.9421L20.0508 42.0517Z" fill="#9138EA" />
        <path d="M15.3589 62.2998L19.8862 67.8014L23.3613 62.5302L18.6148 56.6904L15.3589 62.2998Z" fill="#9138EA" />
        <path d="M58.8689 38.8553L50.2408 43.3359L48.3897 40.8848L62.6659 33.097L58.8689 38.8553Z" stroke="#30085E" strokeWidth="0.75" strokeLinejoin="round" />
        <path d="M62.6699 33.0955L48.3945 40.8831L57.8357 53.4058L23.3434 62.5107L18.6228 56.7026L33.1193 49.0135L23.6781 36.4908L58.2617 27.4069L62.6699 33.0955Z" stroke="#30085E" strokeWidth="0.75" strokeLinejoin="round" />
        <path d="M23.3783 62.4999L19.881 67.8025L54.1604 58.9008L57.8375 53.4031L23.3783 62.4999Z" stroke="#30085E" strokeWidth="0.75" strokeLinejoin="round" />
        <path d="M20.0508 42.0517L23.68 36.4925L33.1218 49.0145L27.5911 51.9421L20.0508 42.0517Z" stroke="#30085E" strokeWidth="0.75" strokeLinejoin="round" />
        <path d="M15.3589 62.2998L19.8862 67.8014L23.3613 62.5302L18.6148 56.6904L15.3589 62.2998Z" stroke="#30085E" strokeWidth="0.75" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
