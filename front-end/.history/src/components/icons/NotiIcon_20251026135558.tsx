import { SVGProps } from "react";

export function NotiIcon(props: SVGProps<SVGSVGElement>) {
	// Minimal bell icon — lightweight, no external deps.
	return (
		<svg
			{...props}
			width={18}
			height={18}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
			className={props.className ?? "inline-block mr-2"}
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
