import type { SVGProps } from "react";

export function AllDone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="-4 -4 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      {...props}
    >
      <style>{`
        @keyframes ad-float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(1deg); }
        }
        @keyframes ad-float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(-1.5deg); }
        }
        @keyframes ad-float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(1.5deg); }
        }
        @keyframes ad-float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(-1deg); }
        }
        @keyframes ad-float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(1.2deg); }
        }
        @keyframes ad-float-6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(-1.5deg); }
        }
        @keyframes ad-float-7 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(0.8deg); }
        }
        @keyframes ad-float-8 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(-1.2deg); }
        }
        .ad-f1 { animation: ad-float-1 3s ease-in-out infinite; animation-delay: 0s; }
        .ad-f2 { animation: ad-float-2 3.4s ease-in-out infinite; animation-delay: 0.4s; }
        .ad-f3 { animation: ad-float-3 2.8s ease-in-out infinite; animation-delay: 0.8s; }
        .ad-f4 { animation: ad-float-4 3.2s ease-in-out infinite; animation-delay: 1.2s; }
        .ad-f5 { animation: ad-float-5 3.6s ease-in-out infinite; animation-delay: 0.6s; }
        .ad-f6 { animation: ad-float-6 2.6s ease-in-out infinite; animation-delay: 1.0s; }
        .ad-f7 { animation: ad-float-7 3.8s ease-in-out infinite; animation-delay: 0.2s; }
        .ad-f8 { animation: ad-float-8 3.1s ease-in-out infinite; animation-delay: 0.9s; }
      `}</style>

      {/* Purple hexagon — top right */}
      <g className="ad-f1">
        <path
          d="M66.4741 16.7705L63.1724 20.1949L64.2837 24.9757L68.6982 26.3337L72 22.9093L70.8872 18.1269L66.4741 16.7705Z"
          fill="#C382FC"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Checkmark body */}
      <path
        d="M63.8521 20.2676C65.1994 19.8812 66.6841 20.1087 67.9468 21.045C69.0592 21.8698 69.8032 23.1021 70.1196 24.4678L68.7593 25.9483L64.562 24.5948H64.563C64.5625 24.5934 64.5615 24.5918 64.561 24.5899L63.6167 20.3292C63.7143 20.3037 63.7952 20.2839 63.8521 20.2676Z"
        fill="#30085E"
        stroke="#30085E"
        strokeWidth="0.75"
      />
      <path
        d="M65.1267 22.4519C63.7509 21.5459 62.1234 21.3226 60.6437 21.6996C60.1047 21.8369 57.3229 22.4249 56.5037 22.7663C55.5057 23.1827 54.6169 23.891 53.9771 24.8626L41.2245 43.591L35.3384 37.7415C33.9953 35.7012 31.5518 34.822 29.3079 35.3694C28.7577 35.5035 25.6325 36.1529 24.6715 36.6576C24.5078 36.7435 24.347 36.8383 24.1889 36.9421C21.5944 38.6508 20.8759 42.1394 22.5842 44.7341L34.5679 59.844C35.5582 61.3477 37.1467 62.2198 38.8121 62.356C38.8138 62.356 38.8156 62.3564 38.8172 62.3564C38.8932 62.3627 38.9694 62.367 39.0459 62.3703C39.073 62.3714 39.1002 62.3725 39.1266 62.3733C39.1781 62.3748 39.2293 62.3753 39.2804 62.3753C39.3319 62.3753 39.3833 62.3748 39.4347 62.3733C39.4617 62.3725 39.4887 62.3714 39.5155 62.3703C39.5918 62.3672 39.6677 62.3627 39.744 62.3564C39.746 62.3564 39.7474 62.356 39.7496 62.356C39.8242 62.3499 39.899 62.342 39.973 62.3332C40.7642 62.2365 44.5332 61.2948 45.1829 60.9688C46.0345 60.5415 46.7888 59.8916 47.3506 59.0385L66.7311 30.2441C68.4398 27.6494 67.7213 24.1604 65.1267 22.4519Z"
        fill="#E65E0A"
        stroke="#30085E"
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <path
        d="M61.7694 23.2571C59.1745 21.5486 55.6857 22.267 53.9771 24.862L39.2805 46.5425L31.9815 38.5466C30.2726 35.9515 26.7842 35.2329 24.1889 36.9416C21.5944 38.6503 20.8759 42.1389 22.5842 44.7336L34.5679 59.8434C35.5582 61.3471 37.1467 62.2193 38.8121 62.3555C38.8138 62.3555 38.8156 62.3559 38.8172 62.3559C38.8932 62.3622 38.9694 62.3665 39.0459 62.3699C39.073 62.3709 39.1002 62.372 39.1266 62.3727C39.1781 62.3743 39.2293 62.3747 39.2804 62.3747C39.3319 62.3747 39.3833 62.3743 39.4347 62.3727C39.4617 62.372 39.4887 62.3709 39.5155 62.3699C39.5918 62.3666 39.6677 62.3622 39.744 62.3559C39.746 62.3559 39.7474 62.3555 39.7497 62.3555C41.4149 62.2191 43.0032 61.3471 43.9937 59.8434L63.374 31.049C65.0827 28.4544 64.3646 24.9657 61.7694 23.2571Z"
        fill="#FC9A55"
        stroke="#30085E"
        strokeWidth="0.75"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />

      {/* Blue circle — top left */}
      <g className="ad-f2">
        <path
          d="M36.3426 15.8609C36.3426 13.9254 34.7734 12.3563 32.8379 12.3563C30.9024 12.3563 29.3334 13.9254 29.3334 15.8609C29.3334 17.7963 30.9024 19.3654 32.8379 19.3654C34.7734 19.3654 36.3426 17.7963 36.3426 15.8609Z"
          fill="#2B7FEE"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Orange circle — bottom left */}
      <g className="ad-f3">
        <path
          d="M27.3148 67.9907C27.3148 66.5167 26.1199 65.3218 24.6459 65.3218C23.1719 65.3218 21.9771 66.5167 21.9771 67.9907C21.9771 69.4647 23.1719 70.6595 24.6459 70.6595C26.1199 70.6595 27.3148 69.4647 27.3148 67.9907Z"
          fill="#FB7F37"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Green hexagon — right */}
      <g className="ad-f4">
        <path
          d="M55.7587 52.3658L54.3448 56.8605L57.5287 60.3327L62.1278 59.3102L63.5432 54.8169L60.3594 51.3448L55.7587 52.3658Z"
          fill="#3DAE63"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Pink circle — left */}
      <path
        d="M21.1942 44.5978C21.2999 44.5787 21.4043 44.5475 21.5028 44.4991C21.6882 44.408 21.8463 44.2608 21.9471 44.0499C22.0417 43.8522 22.0743 43.6203 22.0604 43.3634L22.0614 43.3624L22.0614 43.3605L22.0604 43.3605C22.06 43.3524 22.061 43.3442 22.0604 43.3361L22.0594 43.337C22.0146 42.6718 22.1242 41.985 22.2596 41.422C23.0713 41.4281 23.8084 42.1981 23.8085 43.2531C23.8085 44.3122 23.0654 45.0851 22.2499 45.0851C21.8532 45.0851 21.478 44.9062 21.1942 44.5978Z"
        fill="#30085E"
        stroke="#30085E"
        strokeWidth="0.75"
      />
      <path
        d="M22.9428 43.2506C22.811 42.0387 21.8856 41.1457 20.8759 41.2556C19.8661 41.3654 19.1544 42.4365 19.2862 43.6484C19.4181 44.8603 20.3435 45.7533 21.3532 45.6435C22.3629 45.5336 23.0747 44.4626 22.9428 43.2506Z"
        fill="#F990C8"
        stroke="#30085E"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Blue diamond — bottom center */}
      <g className="ad-f5">
        <path
          d="M42.3668 70.7711L41.6083 71.3822C41.0257 71.8518 40.9338 72.7048 41.4031 73.2875L42.0144 74.046C42.4837 74.6286 43.3371 74.7205 43.9197 74.2509L44.6781 73.6398C45.2608 73.1703 45.3527 72.3172 44.8834 71.7345L44.2721 70.9761C43.8027 70.3933 42.9494 70.3016 42.3668 70.7711Z"
          fill="#2B7FEE"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Orange square — top far left */}
      <g className="ad-f6">
        <path
          d="M8.69953 19.04L8.22137 19.8565C7.77116 20.626 8.02937 21.6147 8.79884 22.0649L9.61466 22.543C10.3841 22.9932 11.3728 22.735 11.823 21.9656L12.3012 21.149C12.7514 20.3803 12.4932 19.3916 11.7237 18.9406L10.9079 18.4632C10.1384 18.0123 9.14973 18.2712 8.69953 19.04Z"
          fill="#FB7F37"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Purple triangle — left */}
      <g className="ad-f7">
        <path
          d="M10.3347 55.6574L11.4484 57.4862C11.7957 58.057 12.6313 58.0364 12.9521 57.4508L13.979 55.572C14.2998 54.985 13.8643 54.2714 13.1963 54.2876L11.0556 54.3391C10.3877 54.3553 9.98748 55.088 10.3347 55.6588L10.3347 55.6574Z"
          fill="#9138EA"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Green triangle — top */}
      <g className="ad-f8">
        <path
          d="M53.6285 5.37572L52.2925 7.31632C51.913 7.86657 52.2719 8.62132 52.9384 8.67429L55.2866 8.86114C55.9531 8.9141 56.4268 8.22556 56.1399 7.62234L55.1277 5.4949C54.8408 4.89168 54.008 4.82547 53.6285 5.37572Z"
          fill="#3DAE63"
          stroke="#30085E"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
