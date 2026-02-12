import { ImageResponse } from "next/og";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation - NexLab hexagonal network icon
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "transparent",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Center hexagon */}
                    <polygon
                        points="50,20 65,30 65,50 50,60 35,50 35,30"
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="3"
                    />

                    {/* Surrounding hexagons */}
                    <polygon points="50,5 62,12 62,27 50,34 38,27 38,12" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
                    <polygon points="73,17 85,24 85,39 73,46 61,39 61,24" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
                    <polygon points="73,53 85,60 85,75 73,82 61,75 61,60" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
                    <polygon points="50,66 62,73 62,88 50,95 38,88 38,73" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
                    <polygon points="27,53 39,60 39,75 27,82 15,75 15,60" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
                    <polygon points="27,17 39,24 39,39 27,46 15,39 15,24" fill="none" stroke="#00f0ff" strokeWidth="2.5" />

                    {/* Center node */}
                    <circle cx="50" cy="40" r="4" fill="#00f0ff" />

                    {/* Outer nodes */}
                    <circle cx="50" cy="20" r="3.5" fill="#00f0ff" />
                    <circle cx="67" cy="31" r="3.5" fill="#00f0ff" />
                    <circle cx="67" cy="64" r="3.5" fill="#00f0ff" />
                    <circle cx="50" cy="80" r="3.5" fill="#00f0ff" />
                    <circle cx="33" cy="64" r="3.5" fill="#00f0ff" />
                    <circle cx="33" cy="31" r="3.5" fill="#00f0ff" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
