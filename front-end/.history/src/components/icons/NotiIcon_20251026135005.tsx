import { SVGProps } from "react";

export function NotiIcon(props: SVGProps<SVGSVGElement>) {
	// Simple notification (bell) SVG. Props forwarded so it can be sized/styled by parent.
	return (
		<svg
			{...props}
			width={20}
			height={20}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M15 17H9a3 3 0 0 1-3-3V11a6 6 0 1 1 12 0v3a3 3 0 0 1-3 3z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13.73 21a2 2 0 0 1-3.46 0"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
