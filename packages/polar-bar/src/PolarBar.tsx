import { createElement, Fragment, ReactNode } from 'react'
import { useDimensions, Container, SvgWrapper } from '@nivo/core'
import { BoxLegendSvg } from '@nivo/legends'
import { ArcLabelsLayer } from '@nivo/arcs'
import { PolarGrid, RadialAxis, CircularAxis } from '@nivo/polar-axes'
import { PolarBarSvgProps, PolarBarDatum, PolarBarLayerId, PolarBarComputedDatum } from './types'
import { svgDefaultProps } from './defaults'
import { usePolarBar } from './hooks'
import { PolarBarArcs } from './PolarBarArcs'

const InnerPolarBar = <RawDatum extends PolarBarDatum>({
    data,
    indexBy = svgDefaultProps.indexBy,
    keys = svgDefaultProps.keys,
    valueSteps,
    adjustValueRange = svgDefaultProps.adjustValueRange,
    valueFormat,

    layers = svgDefaultProps.layers,

    width,
    height,
    margin: partialMargin,

    startAngle = svgDefaultProps.startAngle,
    endAngle = svgDefaultProps.endAngle,
    innerRadius: innerRadiusRatio = svgDefaultProps.innerRadius,
    cornerRadius = svgDefaultProps.cornerRadius,

    colors = svgDefaultProps.colors,
    borderWidth = svgDefaultProps.borderWidth,
    borderColor = svgDefaultProps.borderColor,

    enableArcLabels = svgDefaultProps.enableArcLabels,
    arcLabel = svgDefaultProps.arcLabel,
    arcLabelsSkipAngle = svgDefaultProps.arcLabelsSkipAngle,
    arcLabelsSkipRadius = svgDefaultProps.arcLabelsSkipRadius,
    arcLabelsTextColor = svgDefaultProps.arcLabelsTextColor,
    arcLabelsRadiusOffset = svgDefaultProps.arcLabelsRadiusOffset,
    arcLabelsComponent,

    enableRadialGrid = svgDefaultProps.enableRadialGrid,
    enableCircularGrid = svgDefaultProps.enableCircularGrid,
    radialAxis = svgDefaultProps.radialAxis,
    circularAxisInner = svgDefaultProps.circularAxisInner,
    circularAxisOuter = svgDefaultProps.circularAxisOuter,

    legends = svgDefaultProps.legends,
    forwardLegendData,

    isInteractive = svgDefaultProps.isInteractive,
    tooltip = svgDefaultProps.tooltip,
    onClick,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,

    transitionMode = svgDefaultProps.transitionMode,

    role = svgDefaultProps.role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
}: PolarBarSvgProps<RawDatum>) => {
    const { innerWidth, innerHeight, outerWidth, outerHeight, margin } = useDimensions(
        width,
        height,
        partialMargin
    )

    const {
        center,
        innerRadius,
        outerRadius,
        angleScale,
        radiusScale,
        arcGenerator,
        arcs,
        legendData,
        customLayerProps,
    } = usePolarBar<RawDatum>({
        data,
        indexBy,
        keys,
        valueSteps,
        adjustValueRange,
        valueFormat,
        width: innerWidth,
        height: innerHeight,
        startAngle,
        endAngle,
        innerRadius: innerRadiusRatio,
        cornerRadius,
        colors,
        forwardLegendData,
    })

    const layerById: Record<PolarBarLayerId, ReactNode> = {
        grid: null,
        arcs: null,
        axes: null,
        labels: null,
        legends: null,
    }

    if (layers.includes('grid')) {
        layerById.grid = (
            <PolarGrid
                key="grid"
                center={center}
                enableRadialGrid={enableRadialGrid}
                angleScale={angleScale}
                startAngle={startAngle}
                endAngle={endAngle}
                enableCircularGrid={enableCircularGrid}
                radiusScale={radiusScale}
                circularGridTicks={valueSteps}
            />
        )
    }

    if (layers.includes('arcs')) {
        layerById.arcs = (
            <PolarBarArcs<RawDatum>
                key="arcs"
                arcs={arcs}
                center={center}
                arcGenerator={arcGenerator}
                isInteractive={isInteractive}
                borderColor={borderColor}
                borderWidth={borderWidth}
                tooltip={tooltip}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                transitionMode={transitionMode}
            />
        )
    }

    if (layers.includes('axes')) {
        layerById.axes = (
            <Fragment key="axes">
                {circularAxisInner && innerRadius > 0 && (
                    <CircularAxis
                        type="inner"
                        center={center}
                        radius={innerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        scale={angleScale}
                        {...circularAxisInner}
                    />
                )}
                {circularAxisOuter && (
                    <CircularAxis
                        type="outer"
                        center={center}
                        radius={outerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        scale={angleScale}
                        {...circularAxisOuter}
                    />
                )}
                {radialAxis && (
                    <RadialAxis
                        center={center}
                        scale={radiusScale}
                        ticks={valueSteps}
                        {...radialAxis}
                    />
                )}
            </Fragment>
        )
    }

    if (enableArcLabels && layers.includes('labels')) {
        layerById.labels = (
            <ArcLabelsLayer<PolarBarComputedDatum>
                key="labels"
                center={center}
                data={arcs}
                label={arcLabel}
                radiusOffset={arcLabelsRadiusOffset}
                skipAngle={arcLabelsSkipAngle}
                skipRadius={arcLabelsSkipRadius}
                textColor={arcLabelsTextColor}
                transitionMode={transitionMode}
                component={arcLabelsComponent}
            />
        )
    }

    if (layers.includes('legends') && legends.length > 0) {
        layerById.legends = (
            <Fragment key="legends">
                {legends.map((legend, i) => (
                    <BoxLegendSvg
                        key={i}
                        {...legend}
                        containerWidth={innerWidth}
                        containerHeight={innerHeight}
                        data={legendData}
                    />
                ))}
            </Fragment>
        )
    }

    return (
        <SvgWrapper
            width={outerWidth}
            height={outerHeight}
            margin={margin}
            role={role}
            ariaLabel={ariaLabel}
            ariaLabelledBy={ariaLabelledBy}
            ariaDescribedBy={ariaDescribedBy}
        >
            {layers.map((layer, i) => {
                if (typeof layer === 'function') {
                    return <Fragment key={i}>{createElement(layer, customLayerProps)}</Fragment>
                }

                return layerById?.[layer] ?? null
            })}
        </SvgWrapper>
    )
}

export const PolarBar = <RawDatum extends PolarBarDatum>({
    isInteractive = svgDefaultProps.isInteractive,
    animate = svgDefaultProps.animate,
    motionConfig = svgDefaultProps.motionConfig,
    theme,
    renderWrapper,
    ...otherProps
}: PolarBarSvgProps<RawDatum>) => (
    <Container
        {...{
            animate,
            isInteractive,
            motionConfig,
            renderWrapper,
            theme,
        }}
    >
        <InnerPolarBar isInteractive={isInteractive} {...otherProps} />
    </Container>
)
