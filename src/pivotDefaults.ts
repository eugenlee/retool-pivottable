import type { PivotTableUIProps } from 'react-pivottable'

export const COMPONENT_VERSION = '2.0.0'

export const defaultPivotConfig: Pick<
  PivotTableUIProps,
  'rows' | 'cols' | 'vals' | 'aggregatorName' | 'rendererName'
> = {
  rows: ['Store'],
  cols: ['Date'],
  vals: ['Revenue'],
  aggregatorName: 'Sum',
  rendererName: 'Table'
}
