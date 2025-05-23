import type { Meta, StoryObj } from '@storybook/react'
import { generateLibTree } from '@nivo/generators'
import { linearGradientDef, patternDotsDef } from '@nivo/core'
import { Icicle, IcicleSvgProps, svgDefaultProps, ComputedDatum } from '@nivo/icicle'

interface RawDatum {
    name: string
    loc: number
    color: string
}

const commonProperties: IcicleSvgProps<RawDatum> = {
    width: 900,
    height: 500,
    data: generateLibTree() as any,
    identity: 'name',
    value: 'loc',
    enableLabels: true,
    label: 'id',
    labelTextColor: { from: 'color', modifiers: [['darker', 0.6]] },
    labelSkipWidth: 32,
    labelSkipHeight: 32,
    theme: {
        labels: {
            text: {
                fontSize: 11,
                fontWeight: 600,
                outlineWidth: 1,
                outlineColor: '#ffffff',
                outlineOpacity: 1,
            },
        },
    },
}

const meta: Meta<typeof Icicle> = {
    title: 'Icicle',
    component: Icicle,
    tags: ['autodocs'],
    argTypes: {
        orientation: {
            control: 'select',
            options: ['top', 'right', 'bottom', 'left'],
        },
    },
    args: {
        orientation: svgDefaultProps.orientation,
    },
}

export default meta
type Story = StoryObj<typeof Icicle>

export const Basic: Story = {
    render: args => <Icicle<RawDatum> {...commonProperties} orientation={args.orientation} />,
}

const customPalette = ['#ffd700', '#ffb14e', '#fa8775', '#ea5f94', '#cd34b5', '#9d02d7', '#0000ff']

export const CustomColors: Story = {
    render: args => (
        <Icicle<RawDatum>
            {...commonProperties}
            orientation={args.orientation}
            colors={customPalette}
        />
    ),
}

export const ChildColorPickedFromData: Story = {
    render: args => (
        <Icicle<RawDatum>
            {...commonProperties}
            orientation={args.orientation}
            childColor={(_parent, child) => child.data.color}
        />
    ),
}

export const CustomTooltip: Story = {
    render: args => (
        <Icicle<RawDatum>
            {...commonProperties}
            orientation={args.orientation}
            tooltip={({ id, value, color }) => (
                <div
                    style={{
                        padding: 12,
                        color,
                        background: '#333333',
                    }}
                >
                    <span>Look, I'm custom :)</span>
                    <br />
                    <strong>
                        {id}: {value}
                    </strong>
                </div>
            )}
        />
    ),
}

export const PatternsAndGradients: Story = {
    render: args => (
        <Icicle<RawDatum>
            {...commonProperties}
            orientation={args.orientation}
            defs={[
                linearGradientDef('gradient', [
                    { offset: 0, color: '#ffffff' },
                    { offset: 15, color: 'inherit' },
                    { offset: 100, color: 'inherit' },
                ]),
                patternDotsDef('pattern', {
                    background: 'inherit',
                    color: '#ffffff',
                    size: 2,
                    padding: 3,
                    stagger: true,
                }),
            ]}
            fill={[
                {
                    match: node =>
                        ['viz', 'text', 'utils'].includes(
                            (node as unknown as ComputedDatum<RawDatum>).id as string
                        ),
                    id: 'gradient',
                },
                {
                    match: node =>
                        ['set', 'generators', 'misc'].includes(
                            (node as unknown as ComputedDatum<RawDatum>).id as string
                        ),
                    id: 'pattern',
                },
            ]}
        />
    ),
}
