export function AnvikshaWatermark() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        aria-label="Anviksha Academic Watermark"
        role="img"
      >
        <title>Anviksha Academic Watermark</title>
        <desc>
          Minimal original golden academic watermark seal for Anviksha marksheets.
        </desc>
  
        <defs>
          {/* Transparent cutout for the center of the monogram */}
          <mask
            id="anviksha-a-cutout"
            maskUnits="userSpaceOnUse"
            x="250"
            y="250"
            width="500"
            height="500"
          >
            <rect
              x="250"
              y="250"
              width="500"
              height="500"
              fill="white"
            />
  
            <path
              d="M455 420 H545 L565 480 H435 Z"
              fill="black"
            />
          </mask>
        </defs>
  
        {/* Institutional rings */}
        <g
          fill="none"
          stroke="#c9a961"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle
            cx="500"
            cy="500"
            r="405"
            strokeWidth="5"
          />
  
          <circle
            cx="500"
            cy="500"
            r="380"
            strokeWidth="2"
          />
  
          <circle
            cx="500"
            cy="500"
            r="270"
            strokeWidth="2"
          />
  
          {/* Four institutional markers */}
          <circle
            cx="500"
            cy="118"
            r="5"
            fill="#c9a961"
            stroke="none"
          />
  
          <circle
            cx="500"
            cy="882"
            r="5"
            fill="#c9a961"
            stroke="none"
          />
  
          <circle
            cx="118"
            cy="500"
            r="5"
            fill="#c9a961"
            stroke="none"
          />
  
          <circle
            cx="882"
            cy="500"
            r="5"
            fill="#c9a961"
            stroke="none"
          />
  
          {/* Inner guide marks */}
          <path
            d="M500 205 V225 M500 775 V795"
            strokeWidth="2"
          />
  
          <path
            d="M205 500 H225 M775 500 H795"
            strokeWidth="2"
          />
        </g>
  
        {/* Large geometric Ā monogram */}
        <g
          fill="#c9a961"
          mask="url(#anviksha-a-cutout)"
        >
          {/* Top bar */}
          <path d="M390 295 H610 L595 335 H405 Z" />
  
          {/* Left leg */}
          <path d="M405 345 H475 L360 690 H290 Z" />
  
          {/* Right leg */}
          <path d="M525 345 H595 L710 690 H640 Z" />
  
          {/* Crossbar */}
          <path d="M350 505 H650 L665 550 H335 Z" />
        </g>
  
        {/* Bottom ornament */}
        <circle
          cx="500"
          cy="705"
          r="4"
          fill="#c9a961"
        />
  
        {/* ANVIKSHA */}
        <text
          x="500"
          y="755"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="34"
          fontWeight="600"
          letterSpacing="7"
          fill="#c9a961"
        >
          ANVIKSHA
        </text>
  
        {/* ACADEMIC RECORD */}
        <text
          x="500"
          y="795"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="16"
          fontWeight="500"
          letterSpacing="4"
          fill="#c9a961"
        >
          ACADEMIC RECORD
        </text>
      </svg>
    );
  }