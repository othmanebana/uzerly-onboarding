import { diffDays } from '../lib/timelineUtils'

// Draws SVG connector arrows between consecutive steps (passation)
export default function HandoverArrows({ steps, colWidth, rangeStart, rowHeight = 48 }) {
  const arrows = []

  for (let i = 0; i < steps.length - 1; i++) {
    const from = steps[i]
    const to   = steps[i + 1]
    if (!from._dates || !to._dates) continue

    // Only draw if there's a handover log entry or both steps have owners
    if (!from.owner || !to.owner) continue
    if (from.owner === to.owner) continue // same owner, no arrow needed

    const fromEndDay   = diffDays(rangeStart, from._dates.plannedEnd)
    const toStartDay   = diffDays(rangeStart, to._dates.plannedStart)

    const x1 = fromEndDay * colWidth
    const y1 = i * rowHeight + rowHeight / 2
    const x2 = toStartDay * colWidth
    const y2 = (i + 1) * rowHeight + rowHeight / 2

    // Color based on step status
    const color = from._dates.isDone ? '#13d275' : '#7f88ad'

    if (x2 - x1 < 4) continue // too close, skip

    // Bezier curve from end of from-block to start of to-block
    const cx1 = x1 + Math.min((x2 - x1) * 0.5, 60)
    const cx2 = x2 - Math.min((x2 - x1) * 0.5, 60)

    arrows.push(
      <g key={`arrow-${i}`}>
        <path
          d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={from._dates.isDone ? 'none' : '4 3'}
          opacity={0.7}
          markerEnd="url(#arrowhead)"
        />
        {/* Owner label at midpoint */}
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 4}
          fontSize={9}
          fill={color}
          textAnchor="middle"
          opacity={0.9}
          fontFamily="Poppins, sans-serif"
          fontWeight={600}
        >
          → {to.owner}
        </text>
      </g>
    )
  }

  if (arrows.length === 0) return null

  const totalWidth  = steps.length * 60 * colWidth
  const totalHeight = steps.length * rowHeight + rowHeight

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={totalWidth}
      height={totalHeight}
      style={{ zIndex: 5 }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#7f88ad" opacity={0.8} />
        </marker>
      </defs>
      {arrows}
    </svg>
  )
}
