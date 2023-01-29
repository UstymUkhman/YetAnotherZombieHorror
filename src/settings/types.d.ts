import type { DefaultVisuals } from '@/settings/constants';

type Visuals = Map<VisualKeys, VisualValues>;
type VisualValues = VisualData[VisualKeys];

type RequestSuccess  = (db: IDBDatabase) => void;
type VisualData = typeof DefaultVisuals;
type VisualKeys = keyof VisualData;

type VisualSettings = Array<{
  value: VisualValues,
  enabled: boolean,
  key: VisualKeys,
  name: string
}>;
