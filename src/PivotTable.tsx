import React, { type FC } from 'react'
import PivotTableUI from 'react-pivottable/PivotTableUI'
import type { PivotTableUIProps } from 'react-pivottable'
import 'react-pivottable/pivottable.css'

import { Retool } from '@tryretool/custom-component-support'
import { COMPONENT_VERSION, defaultPivotConfig } from './pivotDefaults'
import { captureEvent, identifyUser } from './posthog'
import { samplePivotData } from './samplePivotData'

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflow: 'auto'
}

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: '#6b7280',
  fontSize: 14
}

type SerializablePivotConfig = {
  rows: string[]
  cols: string[]
  vals: string[]
  aggregatorName: string
  rendererName: string
}

function toSerializableConfig(
  state: Partial<PivotTableUIProps>
): SerializablePivotConfig {
  return {
    rows: state.rows ?? [],
    cols: state.cols ?? [],
    vals: state.vals ?? [],
    aggregatorName: state.aggregatorName ?? defaultPivotConfig.aggregatorName!,
    rendererName: state.rendererName ?? defaultPivotConfig.rendererName!
  }
}

function configsEqual(a: SerializablePivotConfig, b: SerializablePivotConfig) {
  return (
    a.aggregatorName === b.aggregatorName &&
    a.rendererName === b.rendererName &&
    JSON.stringify(a.rows) === JSON.stringify(b.rows) &&
    JSON.stringify(a.cols) === JSON.stringify(b.cols) &&
    JSON.stringify(a.vals) === JSON.stringify(b.vals)
  )
}

export const PivotTable: FC = () => {
  const [pivotData] = Retool.useStateArray({
    name: 'pivotData',
    initialValue: samplePivotData
  })

  const [pivotConfig, setPivotConfig] = Retool.useStateObject({
    name: 'pivotConfig',
    initialValue: toSerializableConfig(defaultPivotConfig),
    description: 'Current pivot layout (rows, cols, vals, aggregator, renderer)'
  })

  const [analyticsUserId] = Retool.useStateString({
    name: 'analyticsUserId',
    initialValue: '',
    description: 'Optional user id for PostHog analytics (e.g. {{ current_user.email }})',
    inspector: 'hidden'
  })

  const [uiState, setUiState] = React.useState<Partial<PivotTableUIProps>>(() => ({
    ...defaultPivotConfig,
    ...toSerializableConfig(pivotConfig as SerializablePivotConfig)
  }))

  const sessionDistinctId = React.useRef(
    'pivot-table-' + Math.random().toString(36).slice(2)
  )
  const configDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const lastCapturedConfig = React.useRef<SerializablePivotConfig | null>(null)

  Retool.useComponentSettings({
    defaultHeight: 400,
    defaultWidth: 12
  })

  React.useEffect(() => {
    const distinctId =
      analyticsUserId.trim() || sessionDistinctId.current
    identifyUser(distinctId)

    captureEvent('pivot_table_mounted', {
      component_version: COMPONENT_VERSION,
      distinct_id_source: analyticsUserId.trim() ? 'retool' : 'session'
    })
  }, [analyticsUserId])

  React.useEffect(() => {
    captureEvent('pivot_table_data_loaded', {
      component_version: COMPONENT_VERSION,
      row_count: Array.isArray(pivotData) ? pivotData.length : 0
    })
  }, [pivotData])

  React.useEffect(() => {
    return () => {
      if (configDebounceRef.current) {
        clearTimeout(configDebounceRef.current)
      }
    }
  }, [])

  const handleStateChange = (nextState: PivotTableUIProps) => {
    setUiState(nextState)

    const serializable = toSerializableConfig(nextState)
    setPivotConfig(serializable)

    if (configDebounceRef.current) {
      clearTimeout(configDebounceRef.current)
    }

    configDebounceRef.current = setTimeout(() => {
      if (
        lastCapturedConfig.current &&
        configsEqual(lastCapturedConfig.current, serializable)
      ) {
        return
      }

      lastCapturedConfig.current = serializable
      captureEvent('pivot_table_configuration_changed', {
        component_version: COMPONENT_VERSION,
        rows: serializable.rows,
        cols: serializable.cols,
        vals: serializable.vals,
        aggregator_name: serializable.aggregatorName,
        renderer_name: serializable.rendererName
      })
    }, 500)
  }

  if (!Array.isArray(pivotData) || pivotData.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>No data to display</div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <PivotTableUI
        data={pivotData as PivotTableUIProps['data']}
        onChange={handleStateChange}
        {...uiState}
      />
    </div>
  )
}
