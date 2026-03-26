"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface LocalizedText {
    en: string
    es: string
}

interface LocalizedTags {
    en: string[]
    es: string[]
}

interface RehabLevel {
    level: number
    name: LocalizedText
    cost: LocalizedText
    description: LocalizedText
    tags: LocalizedTags
    color: string
    textColor: string
}

const rehabLevels: RehabLevel[] = [
    {
        level: 0,
        name: { en: "Turnkey", es: "Llave en mano" },
        cost: { en: "No rehab cost", es: "Sin arreglos" },
        description: {
            en: "Move-in ready. No repairs needed. Perfect condition with modern finishes throughout.",
            es: "Lista para mudarse. No necesita reparaciones. Condición perfecta con acabados modernos."
        },
        tags: { en: [], es: [] },
        color: "#2D5016",
        textColor: "#ffffff",
    },
    {
        level: 1,
        name: { en: "Cosmetic", es: "Cosmético" },
        cost: { en: "~$10 / sqft", es: "~$10 / sqft" },
        description: {
            en: "Light refresh only. Structurally sound with dated finishes.",
            es: "Solo una actualización ligera. Estructuralmente sólida pero con acabados antiguos."
        },
        tags: { en: ["Paint", "Flooring"], es: ["Pintura", "Pisos"] },
        color: "#4CAF50",
        textColor: "#ffffff",
    },
    {
        level: 2,
        name: { en: "Mid-Light", es: "Medio-Ligero" },
        cost: { en: "~$20 / sqft", es: "~$20 / sqft" },
        description: {
            en: "Moderate cosmetic work plus minor repairs. Basic plumbing or electrical touch-ups.",
            es: "Trabajo cosmético moderado más reparaciones menores. Plomería o electricidad básica."
        },
        tags: { en: ["Paint", "Flooring", "Fixtures"], es: ["Pintura", "Pisos", "Accesorios"] },
        color: "#C4B82B",
        textColor: "#1a1a1a",
    },
    {
        level: 3,
        name: { en: "Mid-Heavy", es: "Medio-Pesado" },
        cost: { en: "~$30 / sqft", es: "~$30 / sqft" },
        description: {
            en: "Significant updates needed. Kitchen and bath remodels, HVAC work, or roof repairs.",
            es: "Actualizaciones significativas. Remodelación de cocina y baños, HVAC o reparaciones de techo."
        },
        tags: { en: ["Kitchen", "Bathrooms", "HVAC", "Roof"], es: ["Cocina", "Baños", "HVAC", "Techo"] },
        color: "#F57C00",
        textColor: "#ffffff",
    },
    {
        level: 4,
        name: { en: "Major", es: "Mayor" },
        cost: { en: "~$40 / sqft", es: "~$40 / sqft" },
        description: {
            en: "Major renovation required. Structural issues, foundation work, or complete system replacements.",
            es: "Renovación mayor requerida. Problemas estructurales, cimientos o reemplazo completo de sistemas."
        },
        tags: { en: ["Structural", "Foundation", "Electrical", "Plumbing"], es: ["Estructural", "Cimientos", "Electricidad", "Plomería"] },
        color: "#D32F2F",
        textColor: "#ffffff",
    },
    {
        level: 5,
        name: { en: "Full Gut", es: "Reconstrucción Total" },
        cost: { en: "~$50 / sqft", es: "~$50 / sqft" },
        description: {
            en: "Complete teardown to studs. Rebuild from the ground up.",
            es: "Demolición completa hasta los postes. Reconstrucción desde cero."
        },
        tags: { en: ["Complete Rebuild", "Permits Required"], es: ["Reconstrucción Total", "Permisos Requeridos"] },
        color: "#7B1FA2",
        textColor: "#ffffff",
    },
]

interface RehabConditionWheelProps {
    value?: number
    onChange?: (level: number) => void
    lang?: 'es' | 'en'
}

export default function RehabConditionWheel({ value, onChange, lang = 'es' }: RehabConditionWheelProps) {
    const [internalValue, setInternalValue] = useState<number>(3)

    const selectedLevelNumber = value ?? internalValue
    const selectedLevel = rehabLevels.find((l) => l.level === selectedLevelNumber) ?? rehabLevels[3]

    const handleSelect = useCallback(
        (level: number) => {
            if (onChange) {
                onChange(level)
            } else {
                setInternalValue(level)
            }
        },
        [onChange]
    )

    // Textos estáticos base de la UI
    const uiText = {
        levelLabel: lang === 'en' ? 'LEVEL' : 'NIVEL'
    }

    // SVG donut chart calculations
    const size = 320
    const strokeWidth = 80
    const radius = (size - strokeWidth) / 2
    const center = size / 2

    // Calculate slice positions (6 equal slices)
    const sliceAngle = 360 / 6
    const slices = rehabLevels.map((level, index) => {
        const startAngle = index * sliceAngle - 90
        const endAngle = startAngle + sliceAngle
        return { ...level, startAngle, endAngle, index }
    })

    const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
        const rad = (angle * Math.PI) / 180
        return {
            x: Number((cx + r * Math.cos(rad)).toFixed(3)),
            y: Number((cy + r * Math.sin(rad)).toFixed(3)),
        }
    }

    const createArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
        const start1 = polarToCartesian(center, center, outerRadius, startAngle)
        const end1 = polarToCartesian(center, center, outerRadius, endAngle)
        const start2 = polarToCartesian(center, center, innerRadius, endAngle)
        const end2 = polarToCartesian(center, center, innerRadius, startAngle)

        const largeArc = endAngle - startAngle > 180 ? 1 : 0

        return [
            `M ${start1.x} ${start1.y}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${end1.x} ${end1.y}`,
            `L ${start2.x} ${start2.y}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${end2.x} ${end2.y}`,
            "Z",
        ].join(" ")
    }

    const getLabelPosition = (startAngle: number, endAngle: number) => {
        const midAngle = (startAngle + endAngle) / 2
        const innerRadius = radius - strokeWidth / 2
        const outerRadius = radius + strokeWidth / 2
        const centroidRadius = (2 / 3) * (outerRadius ** 3 - innerRadius ** 3) / (outerRadius ** 2 - innerRadius ** 2)
        return polarToCartesian(center, center, centroidRadius, midAngle)
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                {/* Donut Chart */}
                <div className="relative p-3">
                    <svg width={size} height={size} className="transform -rotate-0" overflow="visible">
                        {slices.map((slice) => {
                            const innerRadius = radius - strokeWidth / 2
                            const outerRadius = radius + strokeWidth / 2
                            const isSelected = slice.level === selectedLevelNumber

                            return (
                                <g key={slice.level}>
                                    <path
                                        d={createArcPath(slice.startAngle, slice.endAngle - 1, innerRadius, outerRadius)}
                                        fill={slice.color}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200",
                                            isSelected ? "opacity-100 drop-shadow-lg" : "opacity-60 hover:opacity-90"
                                        )}
                                        onClick={() => handleSelect(slice.level)}
                                        style={{
                                            filter: isSelected ? "brightness(1.15) drop-shadow(0 0 10px rgba(82,158,20,0.5))" : undefined,
                                            transform: isSelected ? "scale(1.05)" : "scale(1)",
                                            transformOrigin: `${center}px ${center}px`,
                                            transition: "transform 0.2s ease, filter 0.2s ease",
                                        }}
                                    />
                                </g>
                            )
                        })}
                    </svg>

                    {/* Slice Labels */}
                    <svg width={size} height={size} className="absolute top-0 left-0 pointer-events-none" overflow="visible">
                        {slices.map((slice) => {
                            const pos = getLabelPosition(slice.startAngle, slice.endAngle)
                            const dx = 8
                            const midAngle = (slice.startAngle + slice.endAngle) / 2
                            const isTopSlice = Math.sin((midAngle * Math.PI) / 180) < -0.1
                            const dy = isTopSlice ? 12 : 0
                            const costDisplay = slice.level === 0 ? "" : `$${slice.level * 10}/sqft`

                            return (
                                <g key={slice.level}>
                                    <text
                                        x={pos.x + dx} y={pos.y - 7 + dy}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fontSize={12} fontWeight="900" style={{ fill: slice.textColor }}
                                    >
                                        {uiText.levelLabel} {slice.level}
                                    </text>
                                    <text
                                        x={pos.x + dx} y={pos.y + 7 + dy}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fontSize={12} fontWeight="700" style={{ fill: slice.textColor }}
                                    >
                                        {costDisplay}
                                    </text>
                                </g>
                            )
                        })}
                    </svg>

                    {/* Center Circle with Level Info */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-4 border-[#529e14]/20 shadow-inner flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-[#529e14]">{selectedLevel.level}</span>
                        </div>
                    </div>
                </div>

                {/* Selectable List */}
                <div className="flex flex-col gap-2 w-full max-w-[280px]">
                    {rehabLevels.map((level) => {
                        const isSelected = level.level === selectedLevelNumber
                        return (
                            <button
                                key={level.level}
                                type="button"
                                onClick={() => handleSelect(level.level)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left border",
                                    isSelected
                                        ? "bg-white/10 border-[#529e14]"
                                        : "bg-black/20 border-white/5 hover:bg-white/5"
                                )}
                            >
                                <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: level.color }} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">
                                        {uiText.levelLabel} {level.level} — {level.name[lang]}
                                    </div>
                                    <div className="text-xs text-gray-400">{level.cost[lang]}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Detail Card */}
            <div className="mt-6 p-5 rounded-xl bg-black/40 border border-white/10 shadow-inner">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {uiText.levelLabel} {selectedLevel.level} — {selectedLevel.name[lang]}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400 leading-relaxed">{selectedLevel.description[lang]}</p>
                        {selectedLevel.tags[lang].length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {selectedLevel.tags[lang].map((tag) => (
                                    <span key={tag} className="px-2 py-1 text-[10px] uppercase tracking-wider rounded-md bg-[#529e14]/20 text-[#529e14] font-bold border border-[#529e14]/30">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}