import type { SVGProps } from "react";

export function LetsStart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="-4 -4 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      {...props}
    >
      <style>{`
        @keyframes ls-float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes ls-float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-3deg); }
        }
        @keyframes ls-float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes ls-float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-2deg); }
        }
        @keyframes ls-float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(2.5deg); }
        }
        @keyframes ls-float-6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(-1deg); }
        }
        .ls-f1 { animation: ls-float-1 3s ease-in-out infinite; animation-delay: 0s; }
        .ls-f2 { animation: ls-float-2 3.4s ease-in-out infinite; animation-delay: 0.4s; }
        .ls-f3 { animation: ls-float-3 2.8s ease-in-out infinite; animation-delay: 0.8s; }
        .ls-f4 { animation: ls-float-4 3.2s ease-in-out infinite; animation-delay: 1.2s; }
        .ls-f5 { animation: ls-float-5 3.6s ease-in-out infinite; animation-delay: 0.6s; }
        .ls-f6 { animation: ls-float-6 2.6s ease-in-out infinite; animation-delay: 1.0s; }
        @keyframes ls-vibrate {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-0.15px, 0.1px) rotate(-0.08deg); }
          20% { transform: translate(0.2px, -0.15px) rotate(0.1deg); }
          30% { transform: translate(-0.1px, 0.2px) rotate(-0.05deg); }
          40% { transform: translate(0.15px, -0.1px) rotate(0.08deg); }
          50% { transform: translate(-0.2px, 0.05px) rotate(-0.1deg); }
          60% { transform: translate(0.1px, -0.2px) rotate(0.05deg); }
          70% { transform: translate(-0.15px, 0.15px) rotate(-0.08deg); }
          80% { transform: translate(0.2px, -0.05px) rotate(0.1deg); }
          90% { transform: translate(-0.1px, 0.1px) rotate(-0.05deg); }
        }
        .ls-rocket { animation: ls-vibrate 0.3s linear infinite; }
      `}</style>

      {/* Shadow ellipse */}
      <path
        d="M43.0073 72.2861C57.0245 72.2861 68.3872 71.7874 68.3872 71.1728C68.3872 70.5576 57.0245 70.0595 43.0073 70.0595C28.9902 70.0595 17.6272 70.5576 17.6272 71.1728C17.6272 71.7874 28.9902 72.2861 43.0073 72.2861Z"
        fill="#480A8F"
        stroke="#30085E"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Smoke trail */}
      <path
        d="M33.3729 59.492C34.518 53.7798 37.3784 48.0674 41.3865 44.9257L43.9631 47.4962C33.6567 64.6326 44.2519 65.2041 54.2717 60.6344C64.2915 56.0647 64.5779 67.7746 62.574 70.6307C53.9414 72.7837 26.498 72.9079 14.4971 71.0033C13.2184 70.8004 12.1246 69.9326 11.8497 68.6674C11.139 65.3958 11.8218 61.3394 16.7684 60.6344C22.7803 59.7776 31.2594 70.0343 33.3729 59.492Z"
        fill="#E0F8FF"
        stroke="#30085E"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Blue diamond — bottom-left */}
      <g className="ls-f1">
        <path
          d="M29.6233 49.21C28.8323 49.9993 28.8323 51.2789 29.6234 52.0682C30.4145 52.8574 31.6971 52.8574 32.4882 52.0682C33.2793 51.2789 33.2793 49.9993 32.4882 49.2101C31.6971 48.4208 30.4144 48.4208 29.6233 49.21Z"
          fill="#2B7FEE"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Green hexagon — upper-left */}
      <g className="ls-f2">
        <path
          d="M23.4379 28.4227L26.5346 28.4733L28.1291 25.944L26.6268 23.3627L23.53 23.3121L21.9355 25.8427L23.4379 28.4227Z"
          fill="#4BC373"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Orange diamond — right */}
      <g className="ls-f3">
        <path
          d="M59.0342 43.3785C58.4294 43.9833 58.4296 44.9635 59.0342 45.5682C59.6389 46.1729 60.6191 46.173 61.2239 45.5682C61.8287 44.9634 61.8286 43.9832 61.2239 43.3785C60.6193 42.7738 59.639 42.7737 59.0342 43.3785Z"
          fill="#FB7F37"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>

      {/* Orange circle — bottom-center */}
      <g className="ls-f4">
        <path
          d="M39.3319 60.1993C38.5828 60.9467 38.583 62.1578 39.3319 62.905C40.0809 63.6522 41.2949 63.6524 42.0441 62.905C42.7933 62.1576 42.7931 60.9465 42.0441 60.1993C41.2951 59.4521 40.0811 59.4519 39.3319 60.1993Z"
          fill="#FFA96B"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>

      {/* Orange triangle — left */}
      <g className="ls-f5">
        <path
          d="M19.6128 38.7639L20.4464 36.6858C20.7206 36.0039 20.1789 35.2702 19.4719 35.3656L17.3185 35.6577C16.6115 35.7532 16.2696 36.6065 16.7025 37.193L18.0222 38.979C18.4551 39.5655 19.3398 39.447 19.6128 38.7639Z"
          fill="#FFA96B"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>

      {/* Rocket — all body parts vibrate together */}
      <g className="ls-rocket">
        <path
          d="M59.048 49.3468C56.2583 47.6441 54.3624 41.1041 55.2841 39.4987C53.4246 41.8331 49.4604 46.8026 48.4799 48.0058C51.981 49.4283 50.7978 59.9308 49.7685 65.0042L50.9959 65.7056C53.4416 60.7308 58.476 50.4944 59.048 49.3468Z"
          fill="#C24700"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M58.2512 50.7346C53.2998 46.9295 54.3624 41.1041 55.2841 39.4987C53.4246 41.8331 49.4604 46.8026 48.4799 48.0058C51.981 49.4283 50.7978 59.9308 49.7685 65.0042L50.9959 65.7056C53.4416 60.7308 57.6792 51.8822 58.2512 50.7346Z"
          fill="#FB7F37"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M31.6004 33.6624C34.4839 35.2017 41.0978 33.5244 42.0195 31.919C40.9419 34.7002 38.6507 40.6257 38.1066 42.0782C35.1053 39.785 26.6233 46.1168 22.7574 49.5693L21.53 48.8679C24.594 44.2465 30.8975 34.7353 31.6004 33.6624Z"
          fill="#C24700"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M30.8036 35.0502C36.5987 37.386 41.0978 33.5244 42.0195 31.919C40.9419 34.7002 38.6507 40.6257 38.1066 42.0782C35.1053 39.785 26.6233 46.1168 22.7574 49.5693L21.53 48.8679C24.594 44.2465 30.1007 36.1231 30.8036 35.0502Z"
          fill="#FB7F37"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M62.8652 29.674C59.5332 35.4773 52.5494 45.3011 46.9676 50.45C43.8394 50.1312 37.8754 46.6954 36.0524 44.2127C37.6802 36.8044 42.6407 25.8244 45.9726 20.0211C49.8652 13.2414 55.5373 8.72235 62.8211 7.67663C63.7537 7.54275 64.6531 8.06201 65.0003 8.93576C67.8136 16.0159 66.4632 23.4071 62.8652 29.674Z"
          fill="#FFF0F6"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M50.5142 46.5542C49.2799 47.9739 48.0625 49.2704 46.9073 50.363L46.8141 50.4512L46.6862 50.4405C45.1118 50.3065 42.8852 49.3943 40.8561 48.2314C38.827 47.0684 36.9265 45.6151 36.0309 44.3517L35.9569 44.2471L35.9855 44.122C36.3457 42.5751 36.8513 40.8718 37.4543 39.0914C38.7009 40.4906 41.0447 42.1727 43.5156 43.588C45.9884 45.0045 48.6414 46.1841 50.5142 46.5542Z"
          fill="#AE57FA"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M46.8341 36.006C47.1148 35.5171 47.7397 35.3477 48.2298 35.6278C48.7198 35.9078 48.8896 36.5312 48.6089 37.0201L36.9858 57.2642C36.7051 57.7532 36.0803 57.9225 35.5902 57.6424C35.1001 57.3624 34.9304 56.739 35.2111 56.2501L46.8341 36.006Z"
          fill="#C24700"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M62.8494 7.69302C63.7818 7.55918 64.6811 8.07809 65.0284 8.95166C67.8417 16.0318 66.4915 23.4234 62.8934 29.6903C62.6836 30.0558 62.4586 30.4369 62.2211 30.8322C59.3444 29.4841 56.4721 27.9964 53.6213 26.3674C50.7507 24.727 47.9931 22.9952 45.3556 21.1883C45.5762 20.7857 45.7919 20.4014 46.0009 20.0374C49.8935 13.2577 55.5656 8.73874 62.8494 7.69302Z"
          fill="#AE57FA"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M62.8652 29.6739C59.5332 35.4773 52.5494 45.3011 46.9676 50.45C43.8394 50.1312 37.8754 46.6954 36.0524 44.2127C37.6802 36.8044 42.6407 25.8244 45.9726 20.0211C49.8652 13.2413 55.5373 8.72233 62.8211 7.67662C63.7537 7.54274 64.6531 8.06199 65.0003 8.93575C67.8136 16.0159 66.4632 23.4071 62.8652 29.6739Z"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M51.4777 29.2515C53.7953 30.5759 56.7503 29.7751 58.0778 27.4629C59.4053 25.1508 58.6026 22.2028 56.285 20.8784C53.9674 19.5541 51.0124 20.3548 49.6849 22.667C48.3574 24.9791 49.1601 27.9271 51.4777 29.2515Z"
          fill="#FFF0F6"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M52.4589 27.5426C53.8305 28.3264 55.5793 27.8525 56.3649 26.4841C57.1506 25.1157 56.6756 23.3711 55.3039 22.5873C53.9323 21.8035 52.1835 22.2774 51.3978 23.6458C50.6122 25.0142 51.0872 26.7588 52.4589 27.5426Z"
          fill="#ADE8FA"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path
          d="M43.1902 42.3525C43.4709 41.8636 44.0957 41.6943 44.5858 41.9743C45.0759 42.2544 45.2456 42.8778 44.9649 43.3667L36.9857 57.2642C36.705 57.7532 36.0802 57.9225 35.5901 57.6424C35.1 57.3624 34.9303 56.739 35.211 56.2501L43.1902 42.3525Z"
          fill="#FB7F37"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Teal square — bottom-right */}
      <g className="ls-f6">
        <path
          d="M54.6547 58.0553L56.5149 57.6655C57.508 57.4576 58.1441 56.4856 57.9355 55.4946L57.545 53.6388C57.3364 52.6478 56.3621 52.013 55.3687 52.2212L53.5085 52.6109C52.5151 52.8191 51.879 53.7911 52.0876 54.7821L52.4781 56.638C52.687 57.6287 53.6612 58.2635 54.6547 58.0553Z"
          fill="#25A9D4"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
