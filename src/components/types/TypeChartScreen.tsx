import { router } from 'expo-router';

import { TypeChartView } from './TypeChartView';

/** Schermata della sezione Tipi, pronta da montare in una rotta. */
export function TypeChartScreen() {
  return (
    <TypeChartView
      onPressType={(type) => router.push({ pathname: '/types/[typeId]', params: { typeId: type } })}
    />
  );
}
